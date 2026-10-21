# ATS About English correction — PROPOSED ONLY

Prepared: 2026-10-22 (Asia/Hebron). Branch: `feature/ats-auto-translate-he-en`.
Implementation commit: `819e4d8699c253a01d92e1c58437d0920604dadb`.

**No database content changes have been applied. Explicit approval of this exact proposal is required.**

Target: verified local development MySQL on localhost, `gm_alomco_db`, `about_page_content.id=1`.
Scope: `title_en` and `body_en` only. This proposal is not authorization for a production update.

## Source of the visible errors

`About.tsx` renders the CMS `title_en` and flexible `body_en` via the bilingual adapter. Because both body fields exist, the legacy paragraph/bullet fallback is not used. The current English was stored before glossary protection; unchanged Hebrew deliberately preserves it.
The page hero already says `About T.A.S` and needs no change. `subtitle_en`/`subtitle_he` are null and remain null.
The earlier proposal was read and its Hebrew/English body fingerprints still match this snapshot. It only addressed four phrases in `body_en`; this expanded proposal also corrects the heading, missing Windows terminology, and the remaining English prose.

## Real translation verification

Restored the existing SSH local forwarding route `127.0.0.1:5500 → remote 127.0.0.1:5000` using the existing identity/known-host record. No remote command, container change, deployment, or production database access was performed. The local tunnel remains running.
`GET /health`: 200, `status: ok`. `/languages` still lists Hebrew, English and Arabic.

| Check | Real result | Seconds |
|---|---|---|
| Real HTTP Hebrew to English | Installing aluminum windows | 5.532 |
| Actual About heading through ATS glossary | ABOUT Techno Alum System | 0.654 |
| Actual introductory paragraph through ATS glossary | PASS: Techno Alum System preserved; surrounding English returned in uppercase | 1.383 |
| Industry terms in a sentence through ATS glossary | Techno Alum System SPECIALIZES IN curtain walls, ALUCOBOND cladding AND building façades. | 1.29 |
| Complete actual About translation flow without database write | PASS: canonical company/industry terms; 4 paragraphs, 6 bullets, same order | 8.24 |

Captured 12 real HTTP translation responses; all returned 200. No mocked translation responses were used.
The actual `translate_about_content` flow was invoked in memory with current Hebrew and the actual backend settings. No CMS PUT or database update was issued. Every field and timestamp in the local record matched the original snapshot afterward.
Glossary protection works, but the real output still includes uppercase prose and weak wording. The proposed text below is an editorial correction, not an automatic retranslation result.

## Exact proposed changes

| Field | Before | Proposed replacement |
|---|---|---|
| `title_en` | About the Titans of Sistam | About Techno Alum System |
| `body_en` | Four paragraphs and six bullets, with malformed branding/terminology and awkward English | Complete replacement below; same paragraph and bullet order |

### `title_en` — before

```text
About the Titans of Sistam
```

### `title_en` — proposed after

```text
About Techno Alum System
```

### `body_en` — before

```text
The Aluminum Sistm is a leading company in planning, production and installation of advanced aluminum systems for private, commercial and public projects. The company specializes in performing complex aluminum works while ensuring uncompromising quality, engineering accuracy, innovation and meeting timetables.

The company provides a wide range of aluminum solutions, including:

* Screen walls
* The Alkovunds
* Glass and aluminum doors
* Building fronts
* Glass Systems
* customized solutions for special projects

With over 20 years of experience in the aluminum industry, we have gained extensive professional knowledge and reputation based on reliability, professionalism and customer satisfaction. Over the years, we have successfully led a wide range of projects, from prestigious residential buildings to commercial buildings, offices and public buildings.

The company owns an advanced production enterprise equipped with innovative technologies and equipment from industry advances, allowing us to produce personalized aluminum solutions and a particularly high finish level. The combination of professional planning, independent production, experienced staff and strict quality control allows us to provide our customers with a complete solution – from the design stage, through production to the perfect installation on the ground.
```

### `body_en` — proposed after

```text
Techno Alum System is a leading company in the design, manufacture, and installation of advanced aluminum systems for private, commercial, and public projects. We specialize in complex aluminum work, with uncompromising quality, engineering precision, innovation, and a commitment to meeting project schedules.

We provide a wide range of aluminum solutions, including:

* Curtain Walls
* ALUCOBOND Cladding
* Aluminum Windows and Doors
* Building Facades
* Glass Systems
* Custom Solutions for Special Projects

With more than 20 years of experience in the aluminum industry, we have built extensive expertise and a reputation for reliability, professionalism, and customer satisfaction. Over the years, we have successfully delivered a wide range of projects, from luxury residential buildings to commercial properties, offices, and public buildings.

Our advanced manufacturing facility is equipped with innovative technology and state-of-the-art machinery, enabling us to produce custom aluminum solutions with an exceptionally high standard of finish. Professional planning, in-house manufacturing, an experienced team, and rigorous quality control allow us to provide a complete solution, from initial design and manufacturing through to final on-site installation.
```

### Complete body diff

```diff
--- current body_en
+++ proposed body_en
@@ -1,14 +1,14 @@
-The Aluminum Sistm is a leading company in planning, production and installation of advanced aluminum systems for private, commercial and public projects. The company specializes in performing complex aluminum works while ensuring uncompromising quality, engineering accuracy, innovation and meeting timetables.
+Techno Alum System is a leading company in the design, manufacture, and installation of advanced aluminum systems for private, commercial, and public projects. We specialize in complex aluminum work, with uncompromising quality, engineering precision, innovation, and a commitment to meeting project schedules.
 
-The company provides a wide range of aluminum solutions, including:
+We provide a wide range of aluminum solutions, including:
 
-* Screen walls
-* The Alkovunds
-* Glass and aluminum doors
-* Building fronts
+* Curtain Walls
+* ALUCOBOND Cladding
+* Aluminum Windows and Doors
+* Building Facades
 * Glass Systems
-* customized solutions for special projects
+* Custom Solutions for Special Projects
 
-With over 20 years of experience in the aluminum industry, we have gained extensive professional knowledge and reputation based on reliability, professionalism and customer satisfaction. Over the years, we have successfully led a wide range of projects, from prestigious residential buildings to commercial buildings, offices and public buildings.
+With more than 20 years of experience in the aluminum industry, we have built extensive expertise and a reputation for reliability, professionalism, and customer satisfaction. Over the years, we have successfully delivered a wide range of projects, from luxury residential buildings to commercial properties, offices, and public buildings.
 
-The company owns an advanced production enterprise equipped with innovative technologies and equipment from industry advances, allowing us to produce personalized aluminum solutions and a particularly high finish level. The combination of professional planning, independent production, experienced staff and strict quality control allows us to provide our customers with a complete solution – from the design stage, through production to the perfect installation on the ground.
+Our advanced manufacturing facility is equipped with innovative technology and state-of-the-art machinery, enabling us to produce custom aluminum solutions with an exceptionally high standard of finish. Professional planning, in-house manufacturing, an experienced team, and rigorous quality control allow us to provide a complete solution, from initial design and manufacturing through to final on-site installation.
```

## Bullet-by-bullet review

| Hebrew source (unchanged) | Existing English | Proposed English |
|---|---|---|
| קירות מסך | Screen walls | Curtain Walls |
| חיפויי אלוקובונד | The Alkovunds | ALUCOBOND Cladding |
| חלונות ודלתות אלומיניום | Glass and aluminum doors | Aluminum Windows and Doors |
| חזיתות מבנים | Building fronts | Building Facades |
| מערכות זכוכית | Glass Systems | Glass Systems |
| פתרונות מותאמים אישית לפרויקטים מיוחדים | customized solutions for special projects | Custom Solutions for Special Projects |

## Preservation checks and deferred issues

- All Hebrew fields remain byte-for-byte unchanged; none are in the proposed update.
- Four paragraphs remain in their original order. The original six `* ` bullet markers and blank-line structure are retained. Paragraphs after the bullet list remain after it.
- Vision and Mission, in both languages, are excluded and remain unchanged.
- The full company name is consistent within the proposed heading/body. The existing `About T.A.S` page hero uses the other approved form.
- Important deferred conflict: `mission_text_en` still contains `The Aluminum Sistm`. Keeping Mission unchanged prevents full-page brand consistency. A Mission correction would require separate, explicit scope approval.
- Legacy `paragraph_1_en`, `bullet_1_en`, `bullet_2_en`, and `bullet_3_en` also contain old errors. They are inactive while the flexible body is populated and are intentionally outside this patch. Do not silently rewrite them.
- The Hebrew narrative says more than 20 years; the separate Company Numbers data/card previously showed 10+. This proposal retains 20 exactly as the Hebrew source states and changes no statistics. The owner should resolve any factual inconsistency separately.
- No new facts, performance claims, numerical values or list items are introduced.

### Current Vision/Mission English — intentionally unchanged

```text
vision_title_en: Our vision
vision_text_en: We believe that every project is our visit card, and therefore we take care of personal accompaniment, professional service and personal treatment for every customer, while meeting the highest standards of quality, safety and performance.
mission_title_en: Our mission
mission_text_en: The Aluminum Sistm is committed to excellence, innovation and reliability, and continues to lead the field of aluminum through advanced solutions that combine design, functionality and durability over the years.
```

## Approval and concurrency guards

After approval of the exact two after-values above, prepare a backup and re-read this one local record in a transaction. Confirm environment/host/record identity and exact current field/source values against this snapshot. Abort on any mismatch; do not rebase the correction automatically.
Apply only `title_en` and `body_en` in one transaction; leave Hebrew, Vision/Mission, legacy text, numbers, images, unrelated CMS content and every other record untouched. Use a dedicated, approved maintenance operation: the ordinary Admin API intentionally does not permit English-only overrides. Do not change Hebrew merely to trigger retranslation.
No executable update script has been run or supplied. If later applied, rollback restores the exact backed-up two values only while their corrected values still match.

| Guard | Snapshot SHA-256 |
|---|---|
| Entire original record | `a274cf5a71e3d9c9e73976658cedebc5e6927762b999fdc56ed82f8eb4a4e927` |
| All Hebrew fields | `cce0e80f3d763c716f6b4eced1e43873596f246d439ca52c5e9c12d123d038c3` |
| All Vision/Mission fields | `f8d8ae7f329fe8dbd54d6e00dcce4bb65679a3ba1da0ab2f8cda3020db212206` |
| Original title_en | `963a7a3a3da5ba6593515f6ef77045e3447d27bdcd104fba6a5de38ed991b72e` |
| Original body_en | `68a14443deeb074c8cdbfd002783e322ae9c4e86b25ec6f964c2d7513d666f27` |

Original updated_at: `2026-10-21 23:21:23`. Approval must be tied to these exact before/after values. Stop before applying any database change.
