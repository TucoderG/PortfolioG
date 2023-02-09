# PortfolioG

El proyecto cuenta con una pagina principal a la que no se puede acceder sin antes haberse registrado y comfirmado su cuenta mediante email (utilize nodemailer).

Una vez tenga su cuenta registrada en el sistema (MongoDB) podra ingresar a la pagina de inicio y si llegase a olvidar su contraseña podrá recuperarla (Todo eso teniendo en cuenta los errores como no escribir bien el mail, etc. utilizando express-validator.

Este proyecto cuenta con modulos de protección ante ataques de inyección NoSqL, CSRF, Encriptado de contraseña para ser más segura utilizando bcrypt.
Los tokens de confirmacion de cuenta y recuperar contraseña son brindados mediante un codigo único implementando el modulo uuid.

Por tema de que github pages solo permite paginas estaticas no me es posible subir el proyecto completo pero les dejo el codigo para que vean mi trabajo.
