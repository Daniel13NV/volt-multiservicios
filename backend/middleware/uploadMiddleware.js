// backend/middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento (Storage)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // La carpeta donde se guardarán las imágenes
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        // Crear un nombre único para el archivo (ej: material-1234567890-nombre.jpg)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Filtro de archivos para asegurar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes.'), false);
    }
};

// Inicializar Multer con la configuración
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Límite de 5 MB
    }
});

// Exportar como middleware para usarlo en las rutas
exports.uploadMaterialImage = upload.single('imagen'); // 'imagen' es el nombre del campo en el formulario