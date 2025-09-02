# KeyCloak-Auth – Projektbeschreibung & Arbeitsanweisung

## 1) Ziel & Kontext

Dieses Lern- und Beispielprojekt demonstriert **AuthN/AuthZ mit Keycloak** in einer modernen Full‑Stack‑App:

- **Frontend:** Angular v20
- **Backend:** .NET 8 Web API mit Entity Framework Core
- **Identity Provider:** Keycloak
- **Domäne:** _Verkehrsordnung_ (Ampeln, Verkehrsschilder, Ordnungswidrigkeiten, Statistiken)

Primäres Ziel: **Best Practices** für Login (OIDC), Token-Handling, **rollenbasierte Autorisierung** (RBAC) und UI-Anpassung je Rolle. Zusätzlich werden **Client-Rollen** zur **API‑/Service‑spezifischen** Berechtigungssteuerung eingesetzt.

---

## 2) Rollenmodell

### Realm-Rollen & Gruppen (global)

- **Realm-Rollen:** `admin`, `manager`, `user`, `watcher`
- **Gruppen:** `Admins`, `Managers`, `Users`, `Watchers`
- **Zuordnung (Stand heute):**

  - Admins → admin, manager, user, watcher
  - Managers → manager, user
  - Users → user
  - Watchers → watcher

**Verwendung:** Realm-Rollen dienen für **globale** Berechtigungen (z. B. Sichtbarkeit Admin‑Bereich, globale Managementfunktionen).

### Client-Rollen (API-spezifisch)

**Client:** `traffic-api` (Backend)

- `signs.read`, `signs.write`
- `lights.manage`
- `violations.read`, `violations.review`
- `stats.read`
- optional: `admin.full`

**Empfohlene Zuweisung per Gruppe:**

- **Admins:** alle Rollen (inkl. `admin.full`)
- **Managers:** `signs.write`, `lights.manage`, `violations.review`, `stats.read`
- **Users:** `signs.read`, `signs.write`, `violations.read`
- **Watchers:** `signs.read`, `violations.read`, `stats.read`

**Prinzip:** _Least Privilege_ & konsistentes Namensschema `<resource>.<action>`.

---

## 3) Features & Test-Komponenten (Domäne Verkehrsordnung)

1. **Ampelverwaltung** (TrafficLight)

   - Admin: CRUD; Manager: Einstellungen ändern; User/Watcher: lesen

2. **Verkehrsschilder-Katalog** (TrafficSigns)

   - Admin: CRUD; Manager: create/edit; User: Vorschläge; Watcher: lesen

3. **Regelverstöße** (Violations)

   - Admin: vollständig verwalten; Manager: prüfen/freigeben; User: eigene melden/einsehen; Watcher: Statistiken lesen

4. **Statistik-Dashboard** (Statistics)

   - Admin/Manager: voll; User/Watcher: eingeschränkt lesen

5. **Einstellungen/Rollenmanagement** (Settings)

   - Nur Admin/Manager sichtbar; Admin ändert Gruppen/Rollen, Manager projektspezifische Rollen

Jede Komponente dient als **RBAC‑Nachweis**: Buttons, Routen und Aktionen werden abhängig von Rollen/Claims ein- oder ausgeblendet bzw. serverseitig autorisiert.

---

## 4) Architektur & Auth‑Flows

- **Login:** OIDC Authorization Code Flow + PKCE (Angular → Keycloak)
- **Tokens:** Access Token (JWT) + Refresh Token im Frontend; Bearer im API‑Call
- **Bearer‑Weitergabe:** HTTP‑Interceptor im Frontend
- **Backend‑Validierung:** Audience = `traffic-api`, Prüfung der Signatur/Claims
- **Client‑Rollen im Token:** `resource_access.traffic-api.roles` → wird zu Policies/Role‑Claims gemappt
- **UI‑Gating:** Route Guards + Direktiven (`*hasClientRole`) für Sichtbarkeit

---

## 5) Datenmodell (Startpunkt)

- **TrafficSign** (Id, Code, Name, Beschreibung)
- **TrafficLight** (Id, Standort, Status, Schaltzeiten)
- **Violation** (Id, Typ, Ort, Zeit, Status, ReporterUserName)

Identitäten/Benutzerverwaltung liegen **vollständig in Keycloak**; Domänenentitäten via **EF Core**. Optional: Audit‑Tabellen (ErstelltVon/Am, GeändertVon/Am).

---

## 6) Sicherheits- & Qualitätsanforderungen

- **Least Privilege**, Deny‑by‑Default (Server prüft immer Policies)
- **Secrets & Config:** keine Geheimnisse im Repo; `environment.ts` nur öffentliche Metadaten
- **HTTPS only**, CORS restriktiv (Origin‑Whitelist)
- **Logging & Auditing:** sicherheitsrelevante Ereignisse (Login, Fehlversuche, Forbidden) erfassen
- **Fehlerbilder:** 401 (unauth), 403 (forbidden) sauber unterscheiden; UI‑Feedback
- **i18n:** Oberfläche primär DE, klare Fehlermeldungen
- **Performance:** Caching/ETags wo sinnvoll; schlanke DTOs

---

## 7) Aktueller Stand (vom Team geliefert)

- ✅ Angular App aufgesetzt
- ✅ Keycloak in Angular konfiguriert (Bootstrap/Login)
- ✅ Realm‑Rollen angelegt: `admin`, `manager`, `user`, `watcher`
- ✅ Gruppen angelegt + den Rollen zugeordnet (Admins, Managers, Users, Watchers)
- ✅ Benutzer angelegt (je Gruppe ein Test‑User)

---

## 8) Geplanter Umsetzungsfahrplan (iterativ)

**Sprint 1 – Client‑Rollen & End‑to‑End „Verkehrsschilder“**

1. Keycloak: Client `traffic-api` + Client‑Rollen anlegen, Gruppen‑Mappings setzen
2. Angular: Helper `hasClientRole`, Route Guard, Directive `*hasClientRole`
3. Backend: JWT‑Validierung, Claim‑Mapping `resource_access → Role`, Policies (`SignsWrite`, …)
4. Feature: TrafficSigns – UI‑Buttons & Routen rollenbasiert, API‑Endpoints abgesichert
5. Tests: E2E (z. B. Playwright) je Gruppe, Postman‑Collection

**Sprint 2 – Violations & Manager‑Workflow**

- Rollen `violations.read/review` nutzen; Statuswechsel nur für Manager

**Sprint 3 – TrafficLights & Settings**

- `lights.manage`, Admin/Manager‑Einstellungen inkl. Sichtbarkeiten

**Sprint 4 – Statistik‑Dashboard**

- `stats.read`, ggf. separater `stats-api`

---

## 9) Definition of Done (DoD) – Sprint 1

- UI blendet Elemente korrekt je Rolle aus/ein (Watcher sieht keine Schreibaktionen)
- API erzwingt Policies; unberechtigte Requests liefern **403**
- Token‑Refresh im Frontend stabil; Logout räumt Zustand auf
- Dokumentierte Testfälle für Admin/Manager/User/Watcher grün
- Kurze Readme für Setup & Testnutzer

---

## 10) Setup‑Hinweise (Kurz)

**Keycloak**

- Public Client (Angular) für Login (Code+PKCE)
- Confidential Client `traffic-api` (Service Accounts optional)
- Mapper sicherstellen: Client Roles → Access Token (`resource_access`)

**Angular**

- Env: `authUrl`, `realm`, `clientId(frontend)`, `audience='traffic-api'`
- HTTP‑Interceptor für Bearer; Guards/Directives für Sichtbarkeit

**.NET API**

- `Authority` = Realm‑Issuer; `Audience` = `traffic-api`
- Claims‑Mapping: `resource_access.traffic-api.roles` → `ClaimsIdentity(Role)`
- Authorization Policies je Client‑Rolle

---

## 11) Teststrategie

- **Unit:** Helpers/Guards/Services
- **Integration:** Policies/Attribute auf Endpoints
- **E2E:** Login‑Flow, UI‑Gating, 401/403‑Wege
- **Testnutzer:** je Gruppe 1 Account; automatisierte Login‑Steps

---

## 12) CI/CD & Qualität

- Lint/Format (Frontend/Backend), Unit‑Tests in Pipeline
- Optional: Containerisierung (API + Keycloak Dev‑Profile), Docker‑Compose für lokales E2E

---

## 13) Glossar

- **AuthN**: Authentication (Wer bist du?)
- **AuthZ**: Authorization (Was darfst du?)
- **Realm‑Rolle**: globale Berechtigung in Keycloak
- **Client‑Rolle**: spezifisch für einen Client/Service (z. B. API)
- **RBAC**: Role‑Based Access Control
