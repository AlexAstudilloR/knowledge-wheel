// src/lib/foundation.js
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Importa los iconos que quieras usar
import {
  faUser,
  faLock,
  faSignOutAlt,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faEyeSlash,
  faEnvelope,
  faFileExcel,
  faDownload,
  faHourglassStart
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";


// Agregar todos los iconos a la librería
library.add(
  faUser,
  faLock,
  faSignOutAlt,
  faPlus,
  faEdit,
  faTrash,
  faGoogle,
  faFacebook,
  faEye,
  faEyeSlash,
  faEnvelope,
  faFileExcel,
  faDownload,
  faHourglassStart
);

export { FontAwesomeIcon };
