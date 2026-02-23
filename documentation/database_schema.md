# OpenPaddock - Database Schema (TimescaleDB)

Questo documento contiene lo schema relazionale completo del database di OpenPaddock.
La struttura è stata ideata per TimescaleDB, ottimizzata per l'inserimento multi-stagionale tramite i dati della OpenF1 API e preparata per i nuovi campi telemetrici aerodinamici/elettrici del regolamento 2026.

## Schema Relazionale (ERD)

```mermaid
erDiagram
    %% RELAZIONI (Foreign Keys)
    teams ||--o{ drivers : "ha (team_id)"
    seasons ||--o{ events : "contiene (year)"
    circuits ||--o{ events : "ospita (circuit_id)"
    events ||--o{ sessions : "è diviso in (event_id)"
    
    sessions ||--o{ laps : "registra (session_id)"
    drivers ||--o{ laps : "percorre (driver_id)"
    
    sessions ||--o{ pit_stops : "registra (session_id)"
    drivers ||--o{ pit_stops : "effettua (driver_id)"
    
    sessions ||--o{ telemetry : "genera (session_id)"
    drivers ||--o{ telemetry : "genera (driver_id)"

    %% DEFINIZIONE TABELLE
    seasons {
        integer year PK "Es. 2024, 2025"
        timestamp start_date
        timestamp end_date
        timestamp created_at
    }

    circuits {
        integer id PK "Circuit ID (OpenF1)"
        integer key UK "Identificatore Univoco Alternativo"
        varchar short_name "Es. Monza"
        varchar location
        varchar country
        varchar country_code
        real length_km
        integer corners "Num. di Curve"
        timestamp created_at
    }

    teams {
        integer id PK
        varchar name
        varchar color "Codice HEX"
        varchar principal
        varchar base "Sede del team"
        timestamp created_at
    }

    drivers {
        integer id PK
        integer number "Numero Gara"
        varchar broadcast_name "Es. M VERSTAPPEN"
        varchar full_name
        varchar name_acronym "Es. VER"
        integer team_id FK "Rif. teams.id"
        varchar country_code
        varchar headshot_url
        timestamp created_at
    }

    events {
        integer id PK
        integer year FK "Rif. seasons.year"
        integer circuit_id FK "Rif. circuits.id"
        varchar name "Es. Italian Grand Prix"
        varchar official_name
        varchar location
        varchar country_name
        timestamp date_start
        timestamp created_at
    }

    sessions {
        integer id PK
        integer event_id FK "Rif. events.id"
        varchar name "Es. Race, FP1"
        varchar type
        timestamp date_start
        timestamp date_end
        varchar gmt_offset
        timestamp created_at
    }

    laps {
        integer id PK
        integer session_id FK "Rif. sessions.id"
        integer driver_id FK "Rif. drivers.id"
        integer lap_number
        integer lap_duration_ms
        integer sector_1_ms
        integer sector_2_ms
        integer sector_3_ms
        boolean is_pit_out
        boolean is_valid
        timestamp created_at
    }

    pit_stops {
        integer id PK
        integer session_id FK
        integer base_driver_id FK "Rif. drivers.id"
        integer lap_number
        integer stop_duration_ms "Durata netta sosta (ms)"
        integer pit_lane_duration_ms "Tempo totale in corsia (ms)"
        varchar tire_compound "Es. SOFT, MEDIUM"
        timestamp created_at
    }

    telemetry {
        integer session_id FK "Rif. sessions.id"
        integer driver_id FK "Rif. drivers.id"
        timestamp timestamp "Asse temporale (Hypertable TimescaleDB)"
        integer speed_kmh
        integer rpm
        integer gear
        integer throttle_pct
        integer brake_pressure
        integer legacy_drs
        varchar active_aero_mode "Mode 'Z' o 'X' (Reg. 2026)"
        boolean override_mode_active "Push-to-Pass tattico (Reg. 2026)"
        real x_pos
        real y_pos
        real z_pos
    }
```

## Note sull'Implementazione
- **Laps**: Tutti i tempi dei settori e della durata dei giri sono stati tradotti in millisecondi (`integer`) piuttosto che float o stringe, per massimizzare la precisione nei calcoli statistici matematici sul database (evitando problemi ai limiti della virgola mobile o manipolazioni oneroshe sulle stringhe in formato data/ora).
- **Telemetry**: Questa è stata progettata come una tabella pensata all'utilizzo con la funzionalità **Hypertable** di TimescaleDB, partizionata automaticamente per mese d'inserimento o id sessione, per reggere milioni di record creati durante un weekend reale di competizione con query fulminee.  Nasce già predisposta al regolamento [OpenF1 API e FIA 2026](file:///C:/Users/moret/.gemini/antigravity/brain/22b97d67-afff-46c5-b8c6-0ffbc666fc72/openf1_2026_analysis.md).
