# RNF-05 Mantenibilidad

El sistema cumple con el requisito de mantenibilidad porque su estructura está organizada por módulos independientes. Cada funcionalidad principal del sistema se encuentra separada en archivos específicos, lo cual permite realizar cambios, correcciones o mejoras sin afectar directamente el funcionamiento general del sistema.

En el backend, las rutas se encuentran separadas por responsabilidad, por ejemplo:

- multa_router.py
- propietario_router.py
- routers_auth.py
- routers_reportes.py
- consulta_multas_router.py
- recibo_router.py

Esta organización facilita el mantenimiento, ya que si se necesita modificar el módulo de reportes, no es necesario alterar directamente el módulo de multas, propietarios o autenticación.
## Validación del RNF-05 Mantenibilidad

Para validar el requisito de mantenibilidad, se realizó una mejora controlada en el sistema, agregando un nuevo endpoint en el backend utilizando FastAPI.

Se implementó el endpoint:

GET /version

El cual permite consultar información básica del sistema como nombre, versión y estado de actualización.

Después de implementar esta mejora, se verificó que:

- El sistema continúa funcionando correctamente.
- La documentación Swagger (/docs) sigue operativa.
- Los módulos existentes no se vieron afectados.
- El nuevo endpoint responde correctamente con código 200.

Esto demuestra que el sistema permite la incorporación de cambios sin afectar el funcionamiento general, cumpliendo con el requisito de mantenibilidad.