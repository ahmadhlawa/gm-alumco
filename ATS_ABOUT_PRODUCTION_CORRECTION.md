# Production About English correction — separate guarded procedure

Prepared 2026-10-22. **NOT EXECUTED.** This is a separate editorial/data operation,
not an Alembic migration or automatic part of deployment. Local MySQL corrections
to `title_en` and `body_en` are not present in Git and have not reached production.
The local editorial reference stays untracked and must not be copied into the PR.
This document contains procedure code only, no customer database content.

## Identity, approval and backup gates

1. Complete the release runbook's database identity, full backup/isolated restore,
   runtime and migration checks. Require correct schema at `20261021_0001`.
   Keep ATS CMS writers quiesced through capture, approval and correction. No API
   write is appropriate here: English-only updates intentionally return 422 and
   paired Hebrew can regenerate English. Use one explicitly approved DB transaction.
2. Privately inspect the actual database/server and **all candidate About rows**:

   ```sql
   SELECT DATABASE(), @@hostname, @@server_uuid, VERSION();
   SELECT id, title_he, title_en, created_at, updated_at,
          CHAR_LENGTH(body_he), CHAR_LENGTH(body_en)
   FROM about_page_content ORDER BY id;
   SHOW CREATE TABLE about_page_content;
   SELECT TRIGGER_NAME, ACTION_TIMING, EVENT_MANIPULATION
   FROM information_schema.TRIGGERS
   WHERE EVENT_OBJECT_SCHEMA = DATABASE()
     AND EVENT_OBJECT_TABLE = 'about_page_content';
   ```

   Review current full Hebrew/English values privately. Verify the intended site's
   identity with its owner, current titles/body, timestamps and actual displayed
   content. The API selects the lowest ID; a numeric ID alone is insufficient.
   Stop for ambiguous/multiple active candidates or a mismatch with the public page.
   Do not assume a local ID, local source text or local approved English matches.
3. If production `body_he IS NULL`, **do not set `body_en`**: the renderer treats
   either new body as overriding legacy content, which would change the Hebrew
   page to the English fallback. If `body_he` is empty, also stop body correction
   pending editorial review. Reconcile the legacy/new-body state in a separate
   approved plan; this procedure must not populate/change Hebrew fields. A separately
   approved `title_en`-only correction can proceed without changing body fields.
4. Review a private before/after preview against the verified production Hebrew,
   retaining paragraphs and bullet structure. Limit the approved changes to
   `title_en` and/or `body_en`, title <=60 Unicode characters and body <=16,000
   characters / 65,535 UTF-8 bytes. Do not retranslate or globally replace strings.
   Local corrected text is editorial input requiring production-context approval.
5. Before modifying the record, save its **entire current row**, including all legacy
   fields, Vision/Mission, statistics, timestamps and ID, into an exclusive private
   snapshot outside Git/webroots. Keep its checksum and a protected off-host copy.
   Preserve NULL versus empty string and exact Unicode/whitespace. The code below
   captures the row before any modification and locks/rechecks it at apply time.
6. A reviewer approves the exact private snapshot hash, production identity, target
   ID and changed English values. Keep this approval and the final plan hash privately.
   Do not attach the snapshot/plan/content to GitHub or logs. The operator must set
   `APPROVED_PLAN_SHA256` from that independent approval, not compute it automatically
   from an unreviewed plan while applying it.

## Operator code template

Save the following **later**, as a private `about_correction.py` outside the repo and
webroot (mode 0600). Run with the ATS Python, service user, verified service environment
and backend working directory. This imports settings only, no FastAPI startup, ORM
models, translation, audit helpers or seeding. It performs no schema changes.
It deliberately rejects table triggers; a triggered table needs a separately reviewed
DBA procedure, because trigger effects can modify unrelated records/timestamps.

```python
import hashlib
import json
import os
from pathlib import Path
import sys

from sqlalchemy import MetaData, Table, create_engine, select, text
from app.core.config import settings


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical(row):
    # This table contains integers, strings, NULLs and datetime timestamps.
    return json.loads(json.dumps(dict(row), ensure_ascii=False, default=str))


def identity(connection):
    row = connection.execute(text(
        'SELECT DATABASE() AS db, @@server_uuid AS server_uuid'
    )).mappings().one()
    return dict(row)


def private_write(path, value):
    raw = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
    return digest(raw)


def run():
    require(len(sys.argv) >= 3, 'Use snapshot or apply/rollback arguments below')
    mode, path = sys.argv[1:3]
    require(mode in {'snapshot', 'apply', 'rollback'}, 'Unknown mode')
    engine = create_engine(settings.database_url, isolation_level='REPEATABLE READ')
    require(engine.dialect.name == 'mysql', 'Expected verified MySQL connection')
    with engine.begin() as connection:
        actual_identity = identity(connection)
        table = Table('about_page_content', MetaData(), autoload_with=connection)
        columns = [column.name for column in table.columns]
        require({'id', 'title_en', 'body_he', 'body_en', 'updated_at'} <= set(columns),
                'Expected migrated About schema is missing')
        require(connection.execute(text(
            'SELECT ENGINE FROM information_schema.TABLES '
            'WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=:name'
        ), {'name': table.name}).scalar_one() == 'InnoDB', 'Require transactional InnoDB')
        require(connection.execute(text(
            'SELECT COUNT(*) FROM information_schema.TRIGGERS '
            'WHERE EVENT_OBJECT_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=:name'
        ), {'name': table.name}).scalar_one() == 0, 'Triggers require separate DBA review')
        require(connection.execute(text('SELECT version_num FROM alembic_version'))
                .scalars().all() == ['20261021_0001'], 'Unexpected schema revision')

        if mode == 'snapshot':
            require(len(sys.argv) == 6, 'snapshot OUTPUT ID DATABASE SERVER_UUID')
            target_id = int(sys.argv[3])
            require(actual_identity == {'db': sys.argv[4], 'server_uuid': sys.argv[5]},
                    'Database/server identity mismatch')
            row = connection.execute(select(table).where(table.c.id == target_id)
                                     .with_for_update()).mappings().one()
            snapshot = {'identity': actual_identity, 'id': target_id,
                        'columns': columns, 'row': canonical(row)}
            snapshot_hash = private_write(path, snapshot)
            print('Snapshot saved privately; SHA256:', snapshot_hash)
            return

        require(len(sys.argv) == 3, 'apply/rollback PLAN_JSON')
        plan_raw = Path(path).read_bytes()
        require(os.environ.get('APPROVED_PLAN_SHA256') == digest(plan_raw),
                'Missing/mismatched independently approved plan checksum')
        plan = json.loads(plan_raw)
        require(set(plan) == {'snapshot', 'snapshot_sha256', 'changes'}, 'Unknown plan keys')
        snapshot_raw = Path(plan['snapshot']).read_bytes()
        require(digest(snapshot_raw) == plan['snapshot_sha256'], 'Snapshot checksum mismatch')
        before = json.loads(snapshot_raw)
        require(actual_identity == before['identity'], 'Database/server identity mismatch')
        require(columns == before['columns'], 'Schema changed since snapshot')
        changes = plan['changes']
        require(isinstance(changes, dict) and changes
                and set(changes) <= {'title_en', 'body_en'}, 'Only approved English fields allowed')
        for key, value in changes.items():
            require(isinstance(value, str) and value.strip(), 'Require approved nonempty text')
            require(len(value) <= (60 if key == 'title_en' else 16000), 'Field too long')
            require(key != 'body_en' or len(value.encode('utf-8')) <= 65535, 'TEXT byte limit')
        if mode == 'apply' and 'body_en' in changes:
            require(isinstance(before['row']['body_he'], str)
                    and before['row']['body_he'].strip(), 'Body correction requires existing Hebrew body')
        require(any(before['row'][key] != value for key, value in changes.items()), 'No change')
        corrected = {**before['row'], **changes}
        expected = before['row'] if mode == 'apply' else corrected
        row = connection.execute(select(table).where(table.c.id == before['id'])
                                 .with_for_update()).mappings().one()
        # Python equality is exact, including case, whitespace and NULL distinctions;
        # do not rely on MySQL's case-insensitive text collation for this guard.
        require(canonical(row) == expected, 'Record changed since review; abort and re-review')
        replacements = changes if mode == 'apply' else {key: before['row'][key] for key in changes}
        # Explicit raw SQL avoids SQLAlchemy ORM/Python onupdate timestamp hooks.
        # Reassign the original timestamp to suppress a server ON UPDATE timestamp.
        setters = [f'`{key}` = :{key}' for key in replacements]
        setters.append('`updated_at` = :preserved_updated_at')
        params = {**replacements, 'preserved_updated_at': row['updated_at'], 'id': before['id']}
        result = connection.execute(text(
            'UPDATE `about_page_content` SET ' + ', '.join(setters) + ' WHERE `id` = :id'
        ), params)
        require(result.rowcount == 1, 'Expected exactly one target row')
        after = connection.execute(select(table).where(table.c.id == before['id']))
        require(canonical(after.mappings().one()) == {**expected, **replacements},
                'Unexpected field/timestamp change; transaction rolled back')
    engine.dispose()
    print(mode, 'committed; exact full-row guards passed; no content printed')


if __name__ == '__main__':
    run()
```

The snapshot branch writes only a private file and takes a row lock; it performs
no database modification. Apply/rollback commit only at successful transaction exit.
Any identity/content/schema/trigger/rowcount/post-check error rolls back the update.
Use a connection without SQL echo; do not log bound parameters. On an error, record
only the guard name privately: SQL driver exception details may contain customer text.
Rehearse snapshot/apply/rollback on the isolated restored MySQL clone before production.
The template was syntax-checked during preparation; it was not run against a database.

### Capture, review, apply

From `/opt/projects/ats/backend`, with the same verified runtime environment, make
the application import path explicit (`ATS_PYTHON`, ID, paths and identity must be
verified values, not values copied from development):

```bash
umask 077
PYTHONPATH=/opt/projects/ats/backend "$ATS_PYTHON" /private/ats/about_correction.py \
  snapshot /private/ats/about-before.json '<verified production ID>' \
  '<verified ATS database>' '<verified server UUID>'
sha256sum /private/ats/about-before.json
```

Prepare a **separate private** plan JSON with exactly these keys. The strings below
describe fields; substitute actual approved values privately, preserving newlines:

```json
{
  "snapshot": "/private/ats/about-before.json",
  "snapshot_sha256": "independently verified snapshot checksum",
  "changes": {
    "title_en": "approved production-context English title",
    "body_en": "approved production-context English body"
  }
}
```

Omit an English field from `changes` if it is not approved. The snapshot must remain
unchanged; never edit its expected values to make a guard pass. Reviewer compares
the complete snapshot and plan privately and approves the final plan hash. Verify
protected file permissions, approval and off-host backup before applying:

```bash
export APPROVED_PLAN_SHA256='<hash supplied by independent approval>'
PYTHONPATH=/opt/projects/ats/backend "$ATS_PYTHON" /private/ats/about_correction.py \
  apply /private/ats/about-approved-plan.json
unset APPROVED_PLAN_SHA256
```

This command **modifies production data** and is not authorized/executed by release
preparation. It updates only approved English fields and preserves timestamp values.
Full-row guards check Hebrew, Vision/Mission, stats, legacy content and all unrelated
columns before and after; SQL does not write those fields. Keep a private operator
audit record (time, identity, approval/hash, field names and outcome), without content.

Verify the same row with a fresh read and compare all columns; inspect English and
Hebrew public pages and the About editor without saving. A normal CMS save is not a
correction verification step. If browser output differs, inspect fallback/caching
and target identity before changing data again. Future unchanged-Hebrew saves should
preserve approved English; changed Hebrew intentionally generates a new translation.

### Guarded rollback

Requiesce writers; verify the same database/server and approved snapshot/plan hashes.
Obtain rollback approval and use the identical plan (no new values):

```bash
export APPROVED_PLAN_SHA256='<same independently approved plan hash>'
PYTHONPATH=/opt/projects/ats/backend "$ATS_PYTHON" /private/ats/about_correction.py \
  rollback /private/ats/about-approved-plan.json
unset APPROVED_PLAN_SHA256
```

Rollback restores only the changed English fields to their exact snapshot values,
including NULL, and preserves timestamps. It requires the **entire current row** to
match the approved corrected row, so later edits to any field cause an abort. Never
overwrite intervening edits or restore the full record blindly; obtain a new reviewed
reconciliation plan. Verify both language pages and all untouched fields afterwards.

## Separate editorial issue: malformed Mission translation

A malformed English Mission translation was previously reported. Its exact current
production wording and intended revision have not been verified in this preparation.
It is **out of scope** for this release and this English title/body correction.
Do not change `mission_title_en`, `mission_text_en`, paired Hebrew, or Vision fields.
Track it separately for a Hebrew-source/current-English review, an approved preview,
full-row backup, expected-value guards and independent rollback. Do not create a
GitHub issue containing customer text as an incidental part of release preparation.
