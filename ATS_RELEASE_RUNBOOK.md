# ATS release runbook — operator procedure, NOT EXECUTED

Prepared 2026-10-22 for PR [#1](https://github.com/ahmadhlawa/gm-alumco/pull/1),
branch `feature/ats-auto-translate-he-en`. Approved application commit:
`819e4d8699c253a01d92e1c58437d0920604dadb`; use the final reviewed PR head
(including these release documents) as the immutable deployment SHA.

This document supersedes the deployment/configuration/rollback advice and old test
counts in `ATS_PREDEPLOYMENT_VERIFICATION.md`. That file is historical evidence;
its statements that there is no schema change and no push authorization are obsolete.
No production command in this document was run during release preparation.
Deployment, migration, CMS writes, and the separate English correction each need
the operator's applicable production approval. PR publication does not grant it.

## Release scope and checks

All eight application commits from `05070f8` through `819e4d8` were reviewed against
`origin/main`. Four unpublished commits were fast-forward descendants of the fetched
remote feature tip `f268143`. No divergence was present. The application diff affects
56 files, confined to translation, Hebrew CMS forms, About content/rendering,
T.A.S homepage branding, related tests and documentation. Requirements/lockfiles,
authentication implementation and infrastructure configuration are unchanged.

- Backend: endpoints/schemas for projects, production projects/images, services,
  testimonials, partners, About and Company Numbers; configuration;
  `translation_service.py`, `about_content_service.py`; About model and migration.
- Frontend: API client/types/adapters; corresponding Admin forms/mappers;
  About page, shared `AboutBody` renderer, `aboutBody` parser, T.A.S homepage copy.
- Tests cover Hebrew-only writes, unchanged-English preservation, nested captions,
  Company Numbers merging, glossary/model tokens, atomic failures and body structure.
- New schema: `20260710_0001 -> 20261021_0001`, adding nullable TEXT `body_he` and
  `body_en` to `about_page_content`. Legacy columns remain. No content backfill.
- Changed-path and recognizable-secret checks found no real environment files,
  keys/tokens, uploads, dumps, temporary files or generated assets in the release.
  This is a scoped inspection, not a guarantee that no historical secret exists.
- `ATS_ABOUT_TERMINOLOGY_PROPOSED_UPDATE.md` remains local/untracked by instruction.
  Never stage it. No local/customer database content belongs in Git or the PR.

Fresh local validation of application commit `819e4d8` (2026-10-22 session):

| Check | Result |
| --- | --- |
| Backend `python -m pytest -q` | 237 passed, 201.59 seconds; no warnings reported |
| Translation/About regressions | Included in the full passing suite |
| Migration upgrade/downgrade regression | Passed on isolated in-memory SQLite |
| Alembic heads/history/graph assertions | 14 revisions, one base `20260612_0001`, one head `20261021_0001`, no branches/merges |
| MySQL offline migration SQL | Passed; two additive TEXT columns and revision update generated without DB access |
| Frontend `npm test -- --reporter=dot` | 137 passed in 38 files, 29.52 seconds |
| Frontend `npm run typecheck` | Passed |
| Frontend `npm run build` | Passed, 45.37 seconds; JS 637.10 kB / gzip 184.05 kB warning |
| Git whitespace/path/recognizable-secret inspection | Passed |
| Runbook Bash/JSON and correction Python syntax | Passed without executing documented commands |

The backend suite ran with `DATABASE_URL=sqlite://`, isolated fixtures and mocked
translation HTTP; it did not modify local MySQL or call production. Frontend assets
were built locally and remain ignored. Release documentation changes no application
code. Recommendation: **GO for PR review/release preparation; production execution
remains NO-GO until the explicit approval, backup and runtime/manual gates below pass.**

## 1. Read-only production preflight

Run these **only later, on the verified VPS**, in Bash. Do not paste the whole
document as a script. Execute each gate separately and stop on unexpected output.

```bash
cd /opt/projects/ats
test "$(pwd -P)" = /opt/projects/ats
git status --short --branch
git remote get-url origin
git rev-parse HEAD
git branch --show-current
systemctl is-active ats-api.service
systemctl show ats-api.service -p User -p Group -p WorkingDirectory -p MainPID -p FragmentPath
df -h /opt/projects/ats
free -h
```

Verify the repository is `ahmadhlawa/gm-alumco` and all local differences are
understood. Stop for tracked edits, conflicts or unexpected files; never use
`git clean`, reset, forced checkout or force-push. Inspect the ATS unit's existing
ExecStart/environment sources **privately**, without printing secrets. Record:

- Actual running code SHA (`OLD_SHA`), service Python (`ATS_PYTHON`), service user,
  environment files, working directory `/opt/projects/ats/backend`, network context,
  worker timeouts and restart policy. Git HEAD alone does not prove worker code.
- Actual existing ATS frontend document root (`ATS_WEBROOT`), whether it is a real
  directory or symlink, ownership, and old artifact/release location. Inspect the
  existing ATS vhost read-only; **do not edit/reload Nginx**. Do not assume its root
  is `/opt/projects/ats/frontend/dist`.
- Actual database name/host/server identity, MySQL version, TLS/connection options,
  table engines, grants, available disk, and approved backup storage outside Git.
- Any other ATS workers/jobs/database writers; agree a maintenance window and
  pause all ATS writers before the final backup. This must not stop other projects.

Use existing service-environment loading, as the service user, for Python/Alembic;
do not `source .env` as shell code. Process environment overrides backend `.env`.
If these identities, permissions or the existing maintenance mechanism cannot be
verified, **NO-GO**. Do not invent infrastructure changes to proceed.

Fetch is a repository metadata write, not an application switch:

```bash
git fetch origin
RELEASE_SHA='<final reviewed full PR-head SHA>'
OLD_SHA='<verified actual deployed full SHA>'
git cat-file -e "$RELEASE_SHA^{commit}"
git merge-base --is-ancestor 819e4d8699c253a01d92e1c58437d0920604dadb "$RELEASE_SHA"
git diff --stat "$OLD_SHA" "$RELEASE_SHA"
git diff "$OLD_SHA" "$RELEASE_SHA" -- backend/requirements.txt frontend/package-lock.json
```

Any dependency/schema difference beyond the reviewed release needs review before
proceeding. Keep both SHAs and old backend/frontend artifacts in the private log.

## 2. Preserve state, back up and verify

First choose/verify `ATS_BACKUP` as a new private ATS backup directory outside the
repository and outside every webroot. `umask 077`; preserve owner/mode and symlinks
for every service environment file, frontend build environment and persistent upload
target. Resolve `/opt/projects/ats/backend/uploads` with `readlink -f`; archive the
actual target as well as its symlink metadata. Do not rely on Git to preserve them.
Keep checksums privately. Do not replace uploads with an empty release directory.
No `rsync --delete` against the project, uploads or environment directories.

After verifying each path and available space, the preservation commands are:

```bash
ATS_BACKUP='<new private ATS backup directory outside Git and webroots>'
mkdir -m 700 "$ATS_BACKUP"
ATS_ENV_FILES=( '<verified absolute backend environment file>' '<verified absolute frontend environment file>' )
ATS_UPLOAD_TARGET="$(readlink -f /opt/projects/ats/backend/uploads)"
test -d "$ATS_UPLOAD_TARGET"
tar -czpf "$ATS_BACKUP/environment-before.tgz" -- "${ATS_ENV_FILES[@]}"
tar -czpf "$ATS_BACKUP/uploads-path-before.tgz" -C /opt/projects/ats/backend uploads
tar -czpf "$ATS_BACKUP/uploads-target-before.tgz" -C "$ATS_UPLOAD_TARGET" .
sha256sum "$ATS_BACKUP/"*.tgz > "$ATS_BACKUP/files.sha256"
sha256sum -c "$ATS_BACKUP/files.sha256"
```

Expand the environment array to include **every** observed source, including external
systemd environment files and applicable frontend local/production overrides. Confirm
archive inventories privately and rehearse extraction into a disposable directory;
do not extract environment/upload archives over production as a verification step.

Record current schema using the **old running runtime's environment**:

```bash
cd /opt/projects/ats/backend
"$ATS_PYTHON" -m alembic current --verbose
```

Require exactly `20260710_0001` before this migration, or `20261021_0001` only if
both new columns are already verified correct. Stop for any other revision, multiple
rows, partially added columns, missing About table, or unknown deployment history.
Never stamp a revision to bypass a mismatch. Inspect `SHOW CREATE TABLE` and triggers
privately. Capture all About rows, row count and legacy values for comparison.

After ATS writes are quiesced, use an existing protected MySQL option file containing
only the verified ATS connection (no password on the command line). `MYSQL_CNF` and
`ATS_DB` must be independently checked against the backend's effective connection.
`--defaults-extra-file` must be the first MySQL option.

```bash
umask 077
MYSQL_CNF='<absolute existing protected ATS MySQL option file>'
ATS_DB='<verified ATS database name>'
ATS_BACKUP='<verified private ATS backup directory>'
mysql --defaults-extra-file="$MYSQL_CNF" --database="$ATS_DB" \
  --execute='SELECT DATABASE(), @@hostname, @@server_uuid, VERSION(); SELECT * FROM alembic_version;'
mysqldump --defaults-extra-file="$MYSQL_CNF" --single-transaction --quick \
  --routines --triggers --events --hex-blob --no-tablespaces --set-gtid-purged=OFF \
  "$ATS_DB" > "$ATS_BACKUP/ats-before.sql"
test -s "$ATS_BACKUP/ats-before.sql"
sha256sum "$ATS_BACKUP/ats-before.sql" > "$ATS_BACKUP/ats-before.sql.sha256"
sha256sum -c "$ATS_BACKUP/ats-before.sql.sha256"
```

Require successful exit from the dump; a nonempty file/checksum alone is insufficient.
No concurrent DDL is permitted during a single-transaction dump. It guarantees a
consistent snapshot only for transactional tables; stop for non-InnoDB tables and
obtain a database-specific backup plan. Do not add global locks or all-database flags
on this shared VPS. Check restore space and transfer a protected backup off-host.

**Backup verification gate:** restore this dump to an existing approved disposable
MySQL server, never a production/shared database. Verify the destination server UUID,
database name and isolation before using `mysql ... < ats-before.sql`. Restoration
executes DDL/DML and triggers; use an isolated server with event scheduling/network
side effects disabled. Compare table counts, About full rows/legacy values and Alembic
revision to the captured snapshot. Record successful restore evidence and checksum.
If no isolated restore target is available, **NO-GO**; do not create one on the shared
VPS as an implicit part of deployment.

## 3. Stage and verify frontend before downtime

Prefer building on the approved build host to avoid CPU/RAM pressure on other VPS
projects. If building on the VPS is separately approved, use a private unserved ATS
staging directory, check resources, and run as the existing deployment user:

```bash
cd /opt/projects/ats
ATS_STAGE='<new verified unserved ATS staging directory>'
mkdir -m 700 "$ATS_STAGE"
git archive "$RELEASE_SHA" frontend | tar -x -C "$ATS_STAGE"
```

Securely copy the verified frontend `.env`, `.env.local`, `.env.production` and
`.env.production.local` that actually apply, preserving permissions, into staged
`frontend/`. Never copy workstation values. Verify effective `VITE_API_URL` against
the live HTTPS API and Vite base path. Shell `VITE_*` values override env files;
Vite embeds these values in browser assets, so they must contain **no secrets**.

```bash
cd "$ATS_STAGE/frontend"
npm ci
npm run typecheck
npm test -- --reporter=dot
npm run build
test -s dist/index.html
```

Record artifact checksum/manifest and the source SHA. Confirm all referenced assets
exist and API URL is production-correct. This release has a known 637.10 kB JS chunk
warning; successful build does not verify production environment values. Do not run
Vite dev/preview as a production server. Preserve the old frontend artifact before
publishing anything. Do not build directly into the actively served directory.

## 4. Approval gate, migration and backend switch

Require recorded deployment/migration approval, verified restore, preserved state,
staged frontend and paired rollback artifacts before proceeding. Activate the
existing ATS-only maintenance mechanism to prevent public cached forms and CMS
writes during the switch. If none exists, obtain a separately approved ATS-specific
maintenance method; **do not improvise Nginx/shared infrastructure changes**.

The commands below **change production availability, application files or schema**:

```bash
sudo systemctl stop ats-api.service
cd /opt/projects/ats
git switch --detach "$RELEASE_SHA"
git rev-parse HEAD
cd /opt/projects/ats/backend
"$ATS_PYTHON" -m pip check
"$ATS_PYTHON" -m alembic heads
"$ATS_PYTHON" -m alembic current --verbose
```

Verify no other ATS writers remain and Git/environment/upload checks still match.
Dependencies are unchanged by this feature; confirm the existing runtime satisfies
the pinned requirements. If not, stop and prepare a separately reviewed dependency
and virtualenv rollback plan; do not modify a virtualenv shared with other projects.

For verified current revision `20260710_0001` only:

```bash
"$ATS_PYTHON" -m alembic upgrade 20261021_0001
"$ATS_PYTHON" -m alembic current --verbose
```

Require exactly `20261021_0001`, nullable TEXT columns `body_he`/`body_en`, identical
legacy row values/counts and initially NULL new values. If already correctly applied,
verify and skip upgrade. MySQL DDL may implicitly commit: the two ALTER statements
can partially succeed. On failure leave ATS stopped, inspect revision/columns and
have the DBA reconcile the partial state; **do not blindly rerun, stamp or downgrade**.

Privately verify effective backend configuration as the service user in the service
environment, including case-insensitive `.env` loading from the backend directory:

```text
ENVIRONMENT=production (retain existing production security settings)
TRANSLATION_URL=http://127.0.0.1:5000
TRANSLATION_TIMEOUT_SECONDS=15          # >0, <=60
ABOUT_TRANSLATION_TIMEOUT_SECONDS=60    # >0, <=300
```

Preserve database/JWT/SMTP/CORS values. Change only approved ATS translation values
in the existing configuration source if needed, without exposing it. Process-level
values take precedence. Confirm upstream/worker request limits allow measured long
About saves, with margin; if existing limits are inadequate, stop for a separate
configuration decision. Do not modify Nginx, Docker or shared LibreTranslate.

The following prints only nonsecret translation settings. Run it through the
verified existing service-environment mechanism, from the backend working directory:

```bash
"$ATS_PYTHON" -c 'from app.core.config import settings as s; print({"translation_url": s.translation_url, "translation_timeout_seconds": s.translation_timeout_seconds, "about_translation_timeout_seconds": s.about_translation_timeout_seconds})'
```

From the **actual backend service user's runtime/network context**, verify languages
and a synthetic translation; host-loopback success alone is insufficient if isolated:

```bash
curl --fail --silent --show-error --noproxy '*' --connect-timeout 3 --max-time 10 \
  http://127.0.0.1:5000/languages
curl --fail --silent --show-error --noproxy '*' --connect-timeout 3 --max-time 20 \
  -H 'Content-Type: application/json' \
  --data '{"q":"שלום עולם","source":"he","target":"en","format":"text"}' \
  http://127.0.0.1:5000/translate
```

Require Hebrew→English support, plausible nonempty English, acceptable elapsed time
and unchanged existing Arabic/English pairs. Also verify the candidate HTTPX client
with its effective proxy environment; curl's bypass does not prove HTTPX routing.
No API key is sent by this implementation; a key requirement is a failed prerequisite.
Do not install models, restart the translator or change its port (local development
used 5500; the known production service is **5000**).

In the same runtime context, this synthetic, database-free probe exercises actual
HTTPX environment behavior and the candidate protected-term translation code:

```bash
"$ATS_PYTHON" - <<'PY'
from time import monotonic
from app.core.config import settings
from app.services.translation_service import translate_hebrew
start = monotonic()
result = translate_hebrew('טכנו אלום סיסטם היא חברה מובילה')
elapsed = monotonic() - start
if 'Techno Alum System' not in result or elapsed >= settings.translation_timeout_seconds:
    raise RuntimeError('Synthetic runtime translation prerequisite failed')
print({'seconds': round(elapsed, 3), 'synthetic_translation': result})
PY
```

```bash
sudo systemctl start ats-api.service
systemctl is-active ats-api.service
systemctl show ats-api.service -p MainPID -p ActiveEnterTimestamp
```

Stop/start is the coordinated restart procedure. Inspect ATS-only journal entries
privately for startup/import/schema/translation errors. Do not publish logs with
customer values, database URLs, credentials or request bodies.

## 5. Coordinated static publication

Keep ATS maintenance active. Verify the new backend directly through its observed
listen address (`ATS_API_BASE`, ending `/api/v1`) before exposing the new frontend:

```bash
curl --fail --silent --show-error "$ATS_API_BASE/health"
```

Publish only through the established ATS static-release mechanism at the observed
`ATS_WEBROOT`. For a verified **real directory** used exclusively for static assets,
the safe additive sequence is below; verify the resolved root before either rsync:

```bash
test -d "$ATS_WEBROOT"
test ! -L "$ATS_WEBROOT"
rsync -a "$ATS_WEBROOT/" "$ATS_BACKUP/frontend-live-before/"
rsync -a --exclude=index.html "$ATS_STAGE/frontend/dist/" "$ATS_WEBROOT/"
install -m 644 "$ATS_STAGE/frontend/dist/index.html" "$ATS_WEBROOT/.ats-index.next"
mv -f "$ATS_WEBROOT/.ats-index.next" "$ATS_WEBROOT/index.html"
```

Asset paths are hashed; retaining old assets serves cached pages during transition.
Confirm no staged hashed filename overwrites a different old file. The final rename
is atomic on this filesystem; preserve verified web-user readability/ownership.
If the root is a symlink or hosting uses immutable releases, use its already
established atomic release switch instead and record old/new targets. Do not replace
it with the directory recipe. If the existing switch cannot be established, **NO-GO**.
No Nginx reload is required for these static file operations.

## 6. Smoke tests before releasing maintenance

Record operator/time, SHA, revision, artifact manifest, sanitized results and latency.
Set `ATS_PUBLIC_ORIGIN` and `ATS_API_BASE` from observed hosting, not guessed ports.

1. API: internal and HTTPS `/api/v1/health` return `{"status":"ok"}`; public
   projects/services/production-projects load. Check CORS, HTTPS and uploads against
   an existing image without creating files. Health alone does not check MySQL.
2. Authentication: anonymous admin API rejects access. Through the browser, approved
   existing operator login, `/auth/me` and logout work. Login/logout write audit and
   revocation records; these are **approved smoke-test data writes**, not read-only.
3. About prerequisite: verify the expected existing row directly in MySQL first.
   Public/admin About GET can create a singleton when absent; do not probe it as a
   read-only check until existence is established. Multiple rows require review:
   the API chooses the lowest ID.
4. CMS: with an approved disposable record and its cleanup plan, save Hebrew-only
   content across projects, production projects/captions, services, testimonials,
   partners and Company Numbers. Check English generation, unchanged-English
   preservation and numeric/unrelated JSON preservation. Do not edit live customer
   content for a smoke test. Confirm normal admin and superadmin access boundaries.
5. About: on a staging clone (or separately approved target with full-row backup),
   test long Hebrew paragraphs, mixed supported list markers, paragraph/list order,
   preview, semantic `ul/li`, RTL/LTR, literal HTML escaping and legacy fallback.
   Verify Vision/Mission and statistics remain unchanged; inspect T.A.S homepage copy.
6. Translation: review real English sentences containing protected names and terms;
   reject leaked placeholder tokens. Measure a representative long About save within
   the whole-save budget and existing request limits. Confirm UI shows useful errors.
7. Failure behavior: induce timeout/unavailability/malformed-marker/overlength cases
   **only on an isolated staging clone**, never by stopping or misconfiguring shared
   LibreTranslate. Require 503/422 and identical before/after records. Local automated
   coverage does not replace representative production-runtime success checks.
8. Public site: fresh and cached sessions load both languages, About, projects,
   services, navigation, images and mobile layouts; no console/network failures.
   Contact/quote submissions send email/write records; use only separately approved
   synthetic smoke submissions with cleanup, otherwise verify these in staging.

Remove ATS maintenance only after required checks pass. Failed smoke checks trigger
the paired application rollback. Do not change other projects to resolve a failure.

## 7. Rollback

Keep all ATS writers quiesced and preserve post-release data/uploads before rollback.

**Preferred: application and frontend rollback, retain additive columns.** Stop only
`ats-api.service`; check out the recorded `OLD_SHA` with `git switch --detach "$OLD_SHA"`
after confirming no unexpected changes. Restore only approved ATS config changes from
the private backup; preserve current uploads. Restore the old frontend artifact using
the same additive-assets-then-atomic-index sequence (or previous immutable target).
Restart ATS, verify runtime SHA/health/auth/public pages and retain maintenance until
healthy. Roll back backend/frontend together: old backend create schemas require
English, so the Hebrew-only new frontend is incompatible with them. Old frontend also
cannot display later flexible-body edits; preserve new fields for later recovery.

**Schema rollback is normally unnecessary and loses new body content.** If separately
approved, first export every About row including new bodies and verify the export,
confirm head is exactly `20261021_0001` and no later dependent migration exists, stop
ATS writers, and use the new release's migration code/runtime to run:

```bash
"$ATS_PYTHON" -m alembic downgrade 20260710_0001
```

This **drops `body_he` and `body_en`**; legacy paragraphs/bullets do not contain later
flexible-body edits. Verify old schema/revision/legacy data before restarting old code.
Do this before switching away from migration code that knows the new revision.

**Database recovery:** code rollback does not revert translations or editorial writes.
Use the separate guarded About rollback for those fields. Full SQL restore is a
last-resort, separately approved DBA operation to the verified ATS database only;
it replaces schema/data and loses writes since the snapshot. Preserve current data,
assess recovery point/binlogs and rehearse restoration isolated before any production
restore. Never restore an ATS dump into another project or an entire MySQL instance.

## Risks, manual gates and reference documentation

- Production MySQL migration/restore and interactive browser/runtime smoke checks
  were not performed during preparation. Prior local MySQL success is historical
  operator evidence; fresh automated tests use SQLite/mocked HTTP.
- Translation is synchronous; timeouts, upstream limits, service availability and
  English expansion affect saves. A trickling HTTP response can outlast an operation
  budget, though late results cannot save. Review Hebrew proper names/machine quality;
  echoed Hebrew can still pass nonempty-output validation.
- Existing English is preserved when Hebrew is unchanged. Glossary changes do not
  repair stored content. Use [the separate correction procedure](ATS_ABOUT_PRODUCTION_CORRECTION.md).
- Mission mistranslation is a separate editorial issue, excluded from this release.
- Backup/dump/restore, dependency builds and migration metadata locks can consume
  shared VPS resources. Stop/start affects ATS availability. Migration/downgrade,
  CMS/auth smoke tests, correction and SQL restoration affect production data.
- Do not execute global service restarts, Docker changes, Nginx changes/reloads,
  translator/model changes, broad deletions or all-database backup/restore commands.

Current official references consulted via Context7: [Alembic tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html),
[Alembic revision graph](https://alembic.sqlalchemy.org/en/latest/branches.html),
[MySQL 8 mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html),
[Vite 6 deployment](https://v6.vite.dev/guide/static-deploy),
[Vite 6 environment modes](https://v6.vite.dev/guide/env-and-mode).
