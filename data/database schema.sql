-- ============================================================
-- SOIL CARBON MONITORING AND CERTIFICATION SYSTEM
-- ============================================================
create database carbon_credit_system;
use carbon_credit_system;

-- ============================================================
-- TABLE 1: PINCODE_DETAILS
-- Created first — no dependencies
-- ============================================================
CREATE TABLE PINCODE_DETAILS (
    pincode         CHAR(6)         NOT NULL,
    state           VARCHAR(100)    NOT NULL,
    district        VARCHAR(100)    NOT NULL,

    CONSTRAINT pk_pincode
        PRIMARY KEY (pincode),
    CONSTRAINT chk_pincode_format
        CHECK (pincode REGEXP '^[0-9]{6}$')
);

-- ============================================================
-- TABLE 2: FARMER
-- Depends on: PINCODE_DETAILS
-- ============================================================
CREATE TABLE FARMER (
    Farmer_ID       INT             NOT NULL    AUTO_INCREMENT,
    name            VARCHAR(150)    NOT NULL,
    contact         CHAR(10)        NOT NULL,
    pincode         CHAR(6)         NOT NULL,
    registration_no VARCHAR(50)     NOT NULL,

    CONSTRAINT pk_farmer
        PRIMARY KEY (Farmer_ID),
    CONSTRAINT uq_farmer_contact
        UNIQUE (contact),
    CONSTRAINT uq_farmer_registration
        UNIQUE (registration_no),
    CONSTRAINT fk_farmer_pincode
        FOREIGN KEY (pincode)
        REFERENCES PINCODE_DETAILS(pincode)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_farmer_contact
        CHECK (contact REGEXP '^[0-9]{10}$')
);

-- ============================================================
-- TABLE 3: SOIL_TYPE
-- No dependencies
-- ============================================================
CREATE TABLE SOIL_TYPE (
    soil_type_id                INT             NOT NULL    AUTO_INCREMENT,
    type_name                   VARCHAR(100)    NOT NULL,
    carbon_retention_capacity   DECIMAL(5,2)    NOT NULL,

    CONSTRAINT pk_soil_type
        PRIMARY KEY (soil_type_id),
    CONSTRAINT uq_soil_type_name
        UNIQUE (type_name),
    CONSTRAINT chk_carbon_retention
        CHECK (carbon_retention_capacity > 0)
);

-- ============================================================
-- TABLE 4: PLOT
-- Depends on: FARMER, SOIL_TYPE
-- Note: soil_type column stored as soil_type_id (FK) per 3NF
-- ============================================================
CREATE TABLE PLOT (
    Plot_id                 INT             NOT NULL    AUTO_INCREMENT,
    location                VARCHAR(255)    NOT NULL,
    area_hectare            DECIMAL(10,4)   NOT NULL,
    farmer_id               INT             NOT NULL,
    soil_type_id            INT             NOT NULL,
    bulk_density_g_per_cm3  DECIMAL(6,4)    NOT NULL,

    CONSTRAINT pk_plot
        PRIMARY KEY (Plot_id),
    CONSTRAINT fk_plot_farmer
        FOREIGN KEY (farmer_id)
        REFERENCES FARMER(Farmer_ID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_plot_soil_type
        FOREIGN KEY (soil_type_id)
        REFERENCES SOIL_TYPE(soil_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_plot_area
        CHECK (area_hectare > 0),
    CONSTRAINT chk_bulk_density
        CHECK (bulk_density_g_per_cm3 > 0)
);

-- ============================================================
-- TABLE 5: SENSOR_NODE
-- Depends on: PLOT
-- ============================================================
CREATE TABLE SENSOR_NODE (
    sensor_id           INT             NOT NULL    AUTO_INCREMENT,
    sensor_type         VARCHAR(100)    NOT NULL,
    installation_date   DATE            NOT NULL,
    plot_id             INT             NOT NULL,

    CONSTRAINT pk_sensor_node
        PRIMARY KEY (sensor_id),
    CONSTRAINT fk_sensor_plot
        FOREIGN KEY (plot_id)
        REFERENCES PLOT(Plot_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ============================================================
-- TABLE 6: SENSOR_READING
-- Weak entity — Depends on: SENSOR_NODE
-- Composite PK: (sensor_id, timestamp)
-- ============================================================
CREATE TABLE SENSOR_READING (
    sensor_id       INT             NOT NULL,
    timestamp       DATETIME        NOT NULL,
    pH              DECIMAL(4,2)    NOT NULL,
    moisture        DECIMAL(5,2)    NOT NULL,
    nitrogen        DECIMAL(6,2)    NOT NULL,
    phosphorus      DECIMAL(6,2)    NOT NULL,
    potassium       DECIMAL(6,2)    NOT NULL,

    CONSTRAINT pk_sensor_reading
        PRIMARY KEY (sensor_id, timestamp),
    CONSTRAINT fk_reading_sensor
        FOREIGN KEY (sensor_id)
        REFERENCES SENSOR_NODE(sensor_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT chk_pH
        CHECK (pH BETWEEN 0 AND 14),
    CONSTRAINT chk_moisture
        CHECK (moisture BETWEEN 0 AND 100),
    CONSTRAINT chk_nitrogen
        CHECK (nitrogen >= 0),
    CONSTRAINT chk_phosphorus
        CHECK (phosphorus >= 0),
    CONSTRAINT chk_potassium
        CHECK (potassium >= 0)
);

-- ============================================================
-- TABLE 7: CARBON_RECORD
-- Depends on: PLOT
-- ============================================================
CREATE TABLE CARBON_RECORD (
    carbon_id       INT             NOT NULL    AUTO_INCREMENT,
    land_id         INT             NOT NULL,
    period_start    DATE            NOT NULL,
    period_end      DATE            NOT NULL,
    CO2_equivalent  DECIMAL(12,4)   NOT NULL,
    calculated_on   DATE            NOT NULL    DEFAULT (CURRENT_DATE),

    CONSTRAINT pk_carbon_record
        PRIMARY KEY (carbon_id),
    CONSTRAINT fk_carbon_plot
        FOREIGN KEY (land_id)
        REFERENCES PLOT(Plot_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT chk_carbon_period
        CHECK (period_end > period_start),
    CONSTRAINT chk_co2_equivalent
        CHECK (CO2_equivalent >= 0),
    CONSTRAINT chk_carbon_calculated_on
        CHECK (calculated_on >= period_end),
    CONSTRAINT uq_carbon_land_period
        UNIQUE (land_id, period_start, period_end)
);

-- ============================================================
-- TABLE 8: CERTIFICATION_REPORT
-- Depends on: PLOT
-- ============================================================
CREATE TABLE CERTIFICATION_REPORT (
    report_id           INT             NOT NULL    AUTO_INCREMENT,
    land_id             INT             NOT NULL,
    period_start        DATE            NOT NULL,
    period_end          DATE            NOT NULL,
    total_carbon        DECIMAL(12,4)   NOT NULL,
    baseline_co2        DECIMAL(12,4)   NOT NULL,
    additional_co2      DECIMAL(12,4)   NOT NULL,
    carbon_credits      DECIMAL(12,4)   NOT NULL,
    buffer_credits      DECIMAL(12,4)   NOT NULL,
    final_credits       DECIMAL(12,4)   NOT NULL,
    confidence_score    DECIMAL(5,4)    NOT NULL,
    eligibility_status  ENUM('ELIGIBLE', 'NOT_ELIGIBLE', 'PENDING') NOT NULL DEFAULT 'PENDING',
    price_per_credit    DECIMAL(10,2)   NOT NULL,
    estimated_revenue   DECIMAL(15,2)   NOT NULL,
    issued_on           DATE            NOT NULL    DEFAULT (CURRENT_DATE),

    CONSTRAINT pk_certification_report
        PRIMARY KEY (report_id),
    CONSTRAINT fk_report_plot
        FOREIGN KEY (land_id)
        REFERENCES PLOT(Plot_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_report_land_period
        UNIQUE (land_id, period_start, period_end)
);

-- ============================================================
-- TABLE 9: REPORT_CARBON
-- Junction table — M:N between CERTIFICATION_REPORT & CARBON_RECORD
-- Depends on: CERTIFICATION_REPORT, CARBON_RECORD
-- ============================================================
CREATE TABLE REPORT_CARBON (
    report_id       INT     NOT NULL,
    carbon_id       INT     NOT NULL,

    CONSTRAINT pk_report_carbon
        PRIMARY KEY (report_id, carbon_id),
    CONSTRAINT fk_rc_report
        FOREIGN KEY (report_id)
        REFERENCES CERTIFICATION_REPORT(report_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_rc_carbon
        FOREIGN KEY (carbon_id)
        REFERENCES CARBON_RECORD(carbon_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ============================================================
-- TABLE 10: CARBON_READING_MAP
-- Junction table — links CARBON_RECORD to SENSOR_READING
-- Depends on: CARBON_RECORD, SENSOR_READING
-- ============================================================
CREATE TABLE CARBON_READING_MAP (
    sensor_id       INT         NOT NULL,
    carbon_id       INT         NOT NULL,
    timestamp       DATETIME    NOT NULL,

    CONSTRAINT pk_carbon_reading_map
        PRIMARY KEY (sensor_id, carbon_id, timestamp),
    CONSTRAINT fk_crm_reading
        FOREIGN KEY (sensor_id, timestamp)
        REFERENCES SENSOR_READING(sensor_id, timestamp)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_crm_carbon
        FOREIGN KEY (carbon_id)
        REFERENCES CARBON_RECORD(carbon_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ============================================================
-- TABLE 11: USERS (for RBAC)
-- ============================================================
CREATE TABLE USERS (
    user_id     INT             NOT NULL    AUTO_INCREMENT,
    username    VARCHAR(50)     NOT NULL,
    password    VARCHAR(255)    NOT NULL, -- Hash in real app
    role        ENUM('ADMIN', 'ANALYST') NOT NULL,

    CONSTRAINT pk_users
        PRIMARY KEY (user_id),
    CONSTRAINT uq_username
        UNIQUE (username)
);

-- Seed some users
INSERT INTO USERS (username, password, role) VALUES 
('admin_user', 'admin123', 'ADMIN'),
('analyst_user', 'analyst123', 'ANALYST');