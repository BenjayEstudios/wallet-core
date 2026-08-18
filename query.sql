-- Estructura de Base de Datos para Mis Finanzas
CREATE DATABASE IF NOT EXISTS wallet_core DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wallet_core;

CREATE TABLE IF NOT EXISTS tbl_usuarios (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE INDEX email(email)
) ENGINE = INNODB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_categorias (
  id INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) DEFAULT NULL,
  nombre_categoria VARCHAR(50) NOT NULL,
  tipo_flujo ENUM('gasto','ingreso') NOT NULL,
  icono VARCHAR(20) DEFAULT NULL,
  color_hex VARCHAR(10) DEFAULT '#4A5568',
  estado INT(1) DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT fk_cat_user FOREIGN KEY (id_usuario) REFERENCES tbl_usuarios(id) ON DELETE CASCADE
) ENGINE = INNODB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_recurrentes (
  id INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) DEFAULT NULL,
  id_categoria INT(11) NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  monto_estimado INT(11) NOT NULL,
  dia_cobro INT(2) NOT NULL,
  frecuencia ENUM('mensual','anual','semanal') DEFAULT 'mensual',
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE DEFAULT NULL,
  url_pago VARCHAR(255) DEFAULT NULL,
  estado INT(1) DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT fk_rec_categoria FOREIGN KEY (id_categoria) REFERENCES tbl_categorias(id)
) ENGINE = INNODB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_transacciones (
  id INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) DEFAULT NULL,
  id_categoria INT(11) NOT NULL,
  id_recurrente INT(11) DEFAULT NULL,
  tipo_flujo ENUM('gasto','ingreso') NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  monto INT(11) NOT NULL,
  fecha_transaccion DATE NOT NULL,
  estado_pago ENUM('pagado','pendiente','guardado') DEFAULT 'pendiente',
  url_respaldo VARCHAR(255) DEFAULT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  CONSTRAINT fk_tx_categoria FOREIGN KEY (id_categoria) REFERENCES tbl_categorias(id),
  CONSTRAINT fk_tx_recurrente FOREIGN KEY (id_recurrente) REFERENCES tbl_recurrentes(id) ON DELETE SET NULL,
  CONSTRAINT fk_tx_user FOREIGN KEY (id_usuario) REFERENCES tbl_usuarios(id) ON DELETE CASCADE
) ENGINE = INNODB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Limpiamos tabla categorias e insertamos datos de prueba
TRUNCATE TABLE tbl_categorias;

-- Insertamos un usuario de prueba si no existe (id = 1)
INSERT IGNORE INTO tbl_usuarios (id, username, email, password_hash) VALUES (1, 'demo', 'demo@demo.com', '$2y$10$xyz...'); 

-- Categorias por Defecto (Globales, id_usuario = NULL)
INSERT INTO tbl_categorias (id_usuario, nombre_categoria, tipo_flujo, icono, color_hex) VALUES 
(NULL, 'Arriendo', 'gasto', '🏠', '#2A4365'),
(NULL, 'Servicios Básicos', 'gasto', '💡', '#744210'),
(NULL, 'Sueldo', 'ingreso', '💼', '#1C4532');

-- Categorias del Usuario de prueba (id_usuario = 1)
INSERT INTO tbl_categorias (id_usuario, nombre_categoria, tipo_flujo, icono, color_hex) VALUES 
(1, 'Suscripciones', 'gasto', '🎬', '#44337A'),
(1, 'Gastos Hormiga', 'gasto', '🍔', '#5C1A06');
