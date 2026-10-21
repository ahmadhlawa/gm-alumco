# ATS verification: local About save failure

Fix base: `fe77626ac9e8600643797b632f0b01738fadf1e2` on
`feature/ats-auto-translate-he-en`. Verified locally on 2026-10-21.

## Actual failure and diagnosis

- Authenticated `PUT /api/v1/admin/about-page-content` returned **500**, body
  `Internal Server Error`. Chromium reported a missing CORS response header and
  `TypeError: Failed to fetch`, triggering the generic Admin error.
- Backend reproduction raised `sqlalchemy.exc.OperationalError`, MySQL **1054**:
  `Unknown column 'about_page_content.body_he' in 'field list'` during the About
  SELECT. Both new body columns were absent. Database revision was `20260710_0001`;
  Alembic head was `20261021_0001`.
- The actual configured local translator is `http://127.0.0.1:5500`; a real
  Hebrew request returned **200**, `Installing aluminum windows`. Port 5000
  instead returned **400**, `he is not supported`. Existing local configuration
  was retained; no container configuration was changed.
- A long structured request exhausted the former 15-second budget with
  `httpx.ReadTimeout` / **503**. A real browser save with the new About budget
  translated 3,824 Hebrew characters to 5,748 English characters in **19.2 seconds**.

## Fix and local database status

- After checking `ENVIRONMENT=development`, a loopback MySQL host and the local
  database identity, applied the existing additive migration `20261021_0001`.
  Both nullable body columns now exist. A raw before/after comparison of every
  legacy About value matched. No migration source or production database changed.
- About lookup database errors now log a traceback and return actionable JSON
  **503** responses with CORS headers. Browser network failures become readable
  API errors. Admin saving is disabled until existing content has loaded.
- A changed nonempty body uses `ABOUT_TRANSLATION_TIMEOUT_SECONDS`, default **60**,
  greater than zero and at most **300**. Other saves retain their existing shared
  15-second budget. All translation/validation still precedes content mutation.

## Real integration evidence

The local MySQL application user cannot create disposable databases (1044).
Browser integration therefore used a new disposable **local SQLite** database,
current model schema, separate API/frontend processes and synthetic Admin login.
The migration itself was exercised on the verified local MySQL database above.
Neither existing local content nor production data was used for browser edits.

- Actual headless Chromium login and About editor; four long Hebrew paragraphs,
  seven mixed-marker bullets, including paragraphs after the list.
- Click Save: **200**, automatic English, original paragraph/list order and
  `T.A.S` retained. Reload persisted the same content.
- Public Hebrew page displayed four paragraphs and seven bullets. Clicking the
  website **EN** switch displayed the translated body with the same structure.
- Edit, save again, refresh: **passed**. All legacy fields, including every
  Vision/Mission field in both languages, matched their baseline.
- Actual HTTP API against the disposable database with an unreachable loopback
  translation endpoint returned **503**, `Nothing was saved`; the complete stored
  record, including timestamps and image, was unchanged.
- Translation success used the real service on port 5500, without HTTP mocks.
  Regression tests separately cover missing columns, CORS/error visibility,
  extended/bounded deadlines, failed translation atomicity and fallback-save guard.

## Validation and readiness

- Backend complete suite, `python -m pytest -q`: **207 passed** in 157.09 seconds.
- Frontend complete suite, `npm test -- --reporter=dot`: **134 passed**, 37 files.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed**, existing large-chunk warning (637.14 KB JavaScript).
- New failure-handling/long-body/network/load-guard regressions were observed
  failing before their fixes. Independent review found no important issues.

Ready for code review with the local bug fixed and required checks passed.
No production access, Docker/VPS changes, deployment, merge or push was performed.
Before deployment, separately authorize migration `20261021_0001` and verify the
target runtime supports Hebrew and an appropriate About timeout. Rollback may
leave the nullable columns in place; export authored body content before any
schema downgrade. Large input can still hit translation or English length limits;
those failures leave existing content intact. Machine translation quality needs
normal editorial review.

---

# Prior pre-deployment verification (historical)

Updated 2026-10-21. Fix base: `488afb0cb186c66306f4f47ea066a19a5fd9ff58`.
Fix revision: the local commit containing this report; obtain its SHA with
`git rev-parse HEAD` after committing. Branch: `feature/ats-auto-translate-he-en`.
No production access/data writes, deployment, restart, merge, or push performed.
No infrastructure, translation container, dependency pins, or database schema changed.

## Git synchronization

The previous read-only verification fetched these remote tips:

| Reference | Recorded commit | Comparison at fix base |
|---|---|---|
| Local feature branch | `488afb0cb186c66306f4f47ea066a19a5fd9ff58` | Fix base |
| `origin/feature/ats-auto-translate-he-en` | `033b441a2553a75263dc100d06ca806fb6125dbc` | Local ahead 1, behind 0 |
| `origin/main` | `0cef84e0fdbbf217023123fb7b6b16c17b66baeb` | Local ahead 3, behind 0 |

These are recorded comparisons, not fresh remote checks during blocker resolution.
The new local fix commit adds one further commit. No commits were rewritten or pushed.

## Resolved blockers

1. **English-only CMS API bypass closed.** Submitted English fields require their
   paired Hebrew source, including nested production-project image captions.
   Validation runs before translation requests. Unsupported writes return clear
   422 responses. Valid bilingual writes generate English from changed Hebrew and
   ignore incoming English; unchanged Hebrew preserves stored English. Non-text
   partial updates still work. Existing request type/length validation remains.
   Public bilingual response schemas are unchanged.
2. **Company Numbers corruption fixed.** English-only canonical labels now return
   422 instead of clearing or silently replacing English. Label changes patch
   existing JSON and propagate across all existing sections for the same canonical
   ID. Number-only patches preserve labels and require no translation. Stored
   whitespace is normalized when matching unchanged Hebrew. All unrelated dictionary
   properties, other language labels, omitted identified rows, and numeric values
   remain unless explicitly updated. Reclassifying an existing site-content row as
   Company Numbers also validates its content, closing an alternative write path.

Duplicated labels use the first nonempty existing English translation whose Hebrew
matches, in hero/about-preview/about-page/highlight priority, and synchronize copies.
This repairs historical disagreement without retranslating an unchanged source.
Conflicting requested Hebrew labels or duplicate IDs within a section return 422.
Optional clears propagate to all copies. Translation failures leave both the stored
record and input objects unchanged, including when a later field fails after an
initial translation succeeds.

## Validation results

Final validation was executed locally. Backend integration tests use SQLite and
mocked translation HTTP; none contact production.

- Backend complete suite (`python -m pytest -q`): **194 passed**, no warnings.
- Frontend complete suite (`npm test -- --reporter=dot`): **123 passed in 36 files**.
- Frontend `npm run typecheck`: **passed**.
- Frontend `npm run build`: **passed**; existing approximately 635 KB chunk warning.
- New regressions were observed failing before the shared helper fixes.
- Independent review found nested validation-order and legacy whitespace cases;
  both now have focused fixes and regression coverage.
- Follow-up review found no outstanding important issues. `git diff --check` passed.

## Remaining issues and deployment readiness

Both reported code blockers are resolved and all required local validation passed.
**Deployment is not cleared until the existing live runtime smoke checks below pass.**
Production checks remain intentionally unexecuted under this task's restrictions.

Remaining limitations are unchanged: Hebrew proper names and machine translation
quality need review; nonempty echoed Hebrew can pass response validation. Network
operation timeouts can outlast the deadline during a trickling response, although
late results cannot save. Long English can legitimately exceed schema limits and
return 422. MySQL behavior has not been exercised in this local SQLite suite.
The frontend Company Numbers normalization predates this task; backend patch merging
now retains stored properties and rows omitted by its projected payload.

## Required configuration

- `TRANSLATION_URL=http://127.0.0.1:5000` in the backend runtime environment or its
  existing `.env`. Process environment takes precedence over `.env`; loading is
  case-insensitive, and `.env` is resolved relative to the backend working directory.
- `TRANSLATION_TIMEOUT_SECONDS=15` by default, greater than 0 and at most 60.
  This is the shared translation budget per CMS save. Measure realistic About
  content latency before approving this value against upstream request limits.
- The runtime must have existing pinned requirements, including `httpx` and
  `pydantic-settings`. This feature changes no dependency pins or database schema.
- Host loopback must be reachable from the backend's network namespace. A
  successful host curl does not establish reachability from an isolated container.
- Check proxy environment settings privately: the backend HTTPX client uses its
  normal environment behavior. A configured proxy must not misroute loopback calls.
- The current implementation sends no LibreTranslate API key. If the existing
  service requires one, report a failed prerequisite; do not alter its configuration.
- Existing `he -> en` and `ar <-> en` availability must remain intact. Do not install
  models or modify the shared translator during verification.

## Read-only production smoke procedure — NOT EXECUTED

No VPS hostname/SSH target, ATS unit/container, worker PID, release path, or runtime
interpreter was provided or found in the inspected project configuration. No SSH
config exists in this workstation's user profile. All live checks below are pending.
Do not run them against this workstation's loopback and call that production proof.

An authorized VPS operator must first identify the running ATS backend worker,
its service user, Python virtualenv, working directory, environment source, and
network namespace. Record the current backend/frontend release IDs for rollback.
Do not print complete environments, `.env` files, credentials, or process arguments
into the report. If configuration files changed after the worker started, flag the
uncertainty about settings already loaded into memory.

### 1. Host connectivity and installed language pairs

Run on the VPS host, without changing any configuration:

```bash
curl --fail --silent --show-error --noproxy '*' \
  --connect-timeout 3 --max-time 10 http://127.0.0.1:5000/languages
```

Require HTTP 200 and JSON showing `he`, `en`, and `ar`. Confirm `he` targets `en`,
`ar` targets `en`, and `en` targets `ar` where the response lists targets. Record
existing pair availability; do not attempt to repair a failed prerequisite.

### 2. Real Hebrew translation, with synthetic text only

```bash
curl --fail --silent --show-error --noproxy '*' \
  --connect-timeout 3 --max-time 20 \
  -H 'Content-Type: application/json' \
  --data '{"q":"שלום עולם","source":"he","target":"en","format":"text"}' \
  http://127.0.0.1:5000/translate
```

Require HTTP 200, a nonempty `translatedText`, and recognizable English meaning
"Hello world". Do not require one exact spelling/punctuation. Record elapsed time
and the response. This POST performs translation only; it does not call ATS or its
database. Normal translator caches/metrics may change as part of inference.

### 3. Probe from the actual backend runtime context

The following Linux command template uses the verified worker's network/mount
namespaces, effective UID/GID/groups, process environment, working directory, and
the explicitly identified ATS virtualenv interpreter. It runs an ephemeral Python
process; it does not inject code into the worker or change its environment.
Use only where `nsenter` and `/proc` access are already available. Do not install
utilities, change permissions, or modify service/container settings to run it.
Additional service sandbox/cgroup restrictions may require an existing approved
runtime exec mechanism; namespace sharing alone does not reproduce those policies.

Replace both placeholders with observed values, not guesses:

```bash
ATS_PID='<verified running ATS backend worker PID>'
ATS_PYTHON='<absolute existing ATS virtualenv Python path>'
sudo nsenter --target "$ATS_PID" --net --mount \
  "$ATS_PYTHON" -B - "$ATS_PID" "$ATS_PYTHON" <<'PY'
import os
from pathlib import Path
import sys

pid, interpreter = int(sys.argv[1]), sys.argv[2]
proc = Path('/proc') / str(pid)
environment = dict(
    os.fsdecode(entry).split('=', 1)
    for entry in (proc / 'environ').read_bytes().split(b'\0') if entry
)
status = dict(line.split(':', 1) for line in (proc / 'status').read_text().splitlines())
os.chdir(os.readlink(proc / 'cwd'))
os.setgroups([int(group) for group in status['Groups'].split()])
os.setgid(int(status['Gid'].split()[1]))
os.setuid(int(status['Uid'].split()[1]))
environment['PYTHONDONTWRITEBYTECODE'] = '1'
probe = r'''
import json
import os
from time import monotonic
import httpx
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class TranslationProbeSettings(BaseSettings):
    translation_url: str = 'http://127.0.0.1:5000'
    translation_timeout_seconds: float = Field(default=15, gt=0, le=60)
    model_config = SettingsConfigDict(
        env_file='.env', env_file_encoding='utf-8', case_sensitive=False, extra='ignore'
    )

cfg = TranslationProbeSettings()
# Match the candidate loader without importing app.main, ORM, or startup hooks.
assert cfg.translation_url.rstrip('/') == 'http://127.0.0.1:5000', 'Unexpected URL; inspect privately'
print(json.dumps({'uid': os.geteuid(), 'cwd': os.getcwd(),
                  'translation_url': cfg.translation_url,
                  'translation_timeout_seconds': cfg.translation_timeout_seconds}))
start = monotonic()
response = httpx.post(
    cfg.translation_url.rstrip('/') + '/translate',
    json={'q': 'שלום עולם', 'source': 'he', 'target': 'en', 'format': 'text'},
    timeout=cfg.translation_timeout_seconds,
)
response.raise_for_status()
elapsed = monotonic() - start
result = response.json()['translatedText']
assert isinstance(result, str) and result.strip(), 'Empty/invalid translation'
assert elapsed < cfg.translation_timeout_seconds, 'Translation exceeded save budget'
print(json.dumps({'status': response.status_code, 'seconds': round(elapsed, 3),
                  'translatedText': result}, ensure_ascii=False))
'''
os.execve(interpreter, [interpreter, '-B', '-c', probe], environment)
PY
```

Require matching runtime identity/directory, the expected URL/budget, HTTP 200,
plausible English, and latency below budget. Record operator/time, deployed release,
namespace/service restrictions assessed, and sanitized results. This proves the
observed runtime context can reach the translator using the candidate configuration
rules. It cannot prove candidate endpoint execution before the candidate is loaded;
that remains a non-production integration check. Do not deploy to obtain that proof.

Do not invoke ATS create/update endpoints, admin login, seed commands, migrations,
or startup hooks. Avoid About read endpoints: they can create a missing singleton.
No database credentials or database connectivity are needed for these probes.

## Rollback plan — instructions for a separately authorized deployment

1. Before any later rollout, record the actual currently deployed backend and
   frontend immutable releases and configuration; `origin/main` is not evidence
   of what is running. Retain both release artifacts.
2. If the candidate later causes failures, restore the previous **backend and
   frontend together** through the established release mechanism. The Hebrew-only
   frontend is incompatible with the old backend's English-required create schemas.
3. Restore prior translation-related configuration if changed during that rollout.
   Do not alter LibreTranslate, its models, or other projects.
4. No reverse migration, deletion, or bulk data restore is needed: bilingual data
   and the database schema remain compatible. Preserve generated translations and
   uploads. Any restoration of accidentally edited content is a separate decision.
5. Perform read-only health checks using known safe endpoints after rollback.
   A future release switch/service reload requires separate deployment authorization;
   nothing in this verification executes it.

## Exact next steps

1. Keep the validated fixes, tests, README correction, and this report in the local
   fix commit on the existing feature branch; inspect it with `git show --stat HEAD`.
2. Have an authorized operator run smoke steps 1-3 using verified VPS/runtime
   identifiers, attaching sanitized evidence. Do not deploy to obtain that evidence.
3. Recheck remote tips and review synchronization before any separately authorized
   publication. No push is authorized or performed by this task; never force-push.
4. Identify the actual paired backend/frontend rollback releases, then obtain
   separate deployment authorization after smoke evidence and review pass.
