import { useState } from "react";
import { updateUserName } from "../services/userService";

function Profile({ studentName, userEmail, userId, reloadUser }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(studentName || "");

  const handleSave = async () => {
    if (!newName.trim()) return;

    await updateUserName(userId, newName.trim());
    await reloadUser();

    setEditing(false);
  };

  // 🔹 Inicial del avatar
  const initial = (studentName || userEmail || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <section className="profile">
      <h2>👤 Perfil</h2>

      {/* 🔥 Avatar */}
      <div className="avatar">{initial}</div>

      {!editing ? (
        <>
          <p>
            <strong>Nombre:</strong> {studentName || "Estudiante"}
          </p>

          <p>
            <strong>Correo:</strong> {userEmail}
          </p>

          <button onClick={() => setEditing(true)}>
            Editar nombre ✏️
          </button>
        </>
      ) : (
        <>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nuevo nombre"
          />

          <button onClick={handleSave}>Guardar</button>
          <button onClick={() => setEditing(false)}>Cancelar</button>
        </>
      )}
    </section>
  );
}

export default Profile;