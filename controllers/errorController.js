const handleDuplicateFieldsDB = (err) => {
  // Ambil value yang duplikat dari pesan error
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Field ${value} sudah ada. Tolong gunakan nilai lain.`;
  return res.status(400).json({ status: 'fail', message }); // <-- Buat error baru yang lebih rapi
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // Kalo error-nya karena email duplikat (kode 11000)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    
    sendErrorProd(error, res);
  }
};
export default globalErrorHandler;

