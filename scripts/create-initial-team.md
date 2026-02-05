# Crear Team Inicial Manualmente

Si el team no se crea automáticamente, puedes crearlo manualmente desde la aplicación:

1. Ve a `/team` en la aplicación
2. Si no tienes teams, verás un botón "Create Team"
3. Haz clic y crea tu primer team

**O desde Firebase Console:**

1. Ve a https://console.firebase.google.com/project/investiaflow/firestore
2. Crea una nueva colección llamada `teams`
3. Crea un documento con ID manual (o usa el generador)
4. Agrega estos campos:
   - `name`: "Tu Nombre's Team" (o el nombre que quieras)
   - `ownerId`: Tu userId (el mismo que aparece en `leads` o `documents`)
   - `createdAt`: Timestamp (usa el botón de timestamp)
   - `updatedAt`: Timestamp

5. Luego crea un documento en la colección `teamMembers`:
   - `teamId`: El ID del team que acabas de crear
   - `userId`: Tu userId
   - `email`: Tu email
   - `name`: Tu nombre
   - `role`: "owner"
   - `invitedBy`: Tu userId
   - `joinedAt`: Timestamp
   - `status`: "active"

Después de esto, recarga la aplicación y deberías ver tu team.
