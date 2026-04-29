import { useState } from "react";
import { updateUserName } from "../services/userService";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

function Profile({ studentName, userEmail, userId, userPhoto, reloadUser }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(studentName || "");
  const [localPhoto, setLocalPhoto] = useState(userPhoto || "");

  const handleSave = async () => {
    if (!newName.trim()) return;

    await updateUserName(userId, newName.trim());
    await reloadUser();

    setEditing(false);
  };

  const handleUpload = async (e) => {
  alert("Elegiste una foto");

  const file = e.target.files[0];
  if (!file) return;

  try {
    // 👇 PRIMERO creas storageRef
    const storageRef = ref(storage, `avatars/${userId}`);
    alert (" Antes de subir a firebase");
    // 👇 SUBES archivo
    await uploadBytes(storageRef, file);
    alert (" Despúes de subir a firebase");


    // 👇 DESPUÉS obtienes URL
    const photoURL = await getDownloadURL(storageRef);

    console.log("URL:", photoURL);
    alert("URL: " + photoURL);

    // 👇 GUARDAS en Firestore
    await updateDoc(doc(db, "users", userId), {
      photoURL: photoURL,
    });

    await reloadUser();

    alert("Foto subida correctamente");

} catch (error) {
  console.log("Error subiendo imagen:", error);
  alert("Error real: " + error.message);
}
};

  const initial = (studentName || userEmail || "U")[0].toUpperCase();
  const photoToShow = localPhoto || userPhoto;

  return (
    <section className="profile">
      <h2>👤 Perfil</h2>

      <div className="avatar">
        {photoToShow ? <img src={photoToShow} alt="avatar" /> : initial}
      </div>

      {/* <label className="upload-btn">
        📸 Subir foto
        <input type="file" accept="image/*" onChange={handleUpload} hidden />
      </label> */}
            <input
  type="file"
  accept="image/*"
  onChange={handleUpload}
/>
      {!editing ? (
        <>
          <p>
            <strong>Nombre:</strong> {studentName || "Estudiante"}
          </p>

          <p>
            <strong>Correo:</strong> {userEmail}
          </p>

          <button onClick={() => setEditing(true)}>Editar nombre ✏️</button>
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