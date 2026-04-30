import { useState } from "react";
import { updateUserName } from "../services/userService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage, db } from "../firebase";

function Profile({
  studentName,
  userEmail,
  userId,
  userPhoto,
  reloadUser,
  streak,
  completedDays,
  pomodoroSessions,
  rankingPosition,
}) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(studentName || "");
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!newName.trim()) return;

    await updateUserName(userId, newName.trim());
    await reloadUser();

    setEditing(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;

    try {
      setUploading(true);

      const storageRef = ref(storage, `avatars/${userId}/profile-${Date.now()}`);
      await uploadBytes(storageRef, file);

      const photoURL = await getDownloadURL(storageRef);

      await setDoc(
        doc(db, "users", userId),
        {
          photoURL,
        },
        { merge: true }
      );

      await reloadUser();
      alert("Foto subida correctamente");
    } catch (error) {
      console.log("Error subiendo imagen:", error);
      alert("Error al subir foto: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const initial = (studentName || userEmail || "U")[0].toUpperCase();

  const getMotivationMessage = () => {
    if (completedDays >= 30) {
      return "👑 Completaste el desafío de 30 días. ¡Eres imparable!";
    }

    if (rankingPosition === 1 && completedDays >= 10) {
      return "🏆 Vas #1 en el ranking y ya tienes una gran constancia. ¡Sigue defendiendo tu lugar!";
    }

    if (streak >= 7) {
      return `🔥 Llevas ${streak} días de racha. Esto ya es disciplina real.;`
    }

    if (streak >= 3) {
      return `💪 Racha de ${streak} días. Estás construyendo un hábito poderoso.;`
    }

    if (pomodoroSessions >= 10) {
      return `🍅 ${pomodoroSessions} Pomodoros completados. Tu enfoque está subiendo de nivel.;`
    }

    if (completedDays >= 15) {
      return `🚀 Ya completaste ${completedDays}/30 días. Vas en la mitad del camino.;`
    }

    if (completedDays >= 5) {
      return `🌱 ${completedDays} días completados. La constancia empieza a notarse.;`
    }

    if (pomodoroSessions >= 1) {
      return "🍅 Ya completaste tu primer Pomodoro. Ahora repite y gana ritmo.";
    }

    return "🔥 Empieza con 1 Pomodoro hoy. Pequeños pasos crean grandes resultados.";
  };

  return (
    <section className="profile-container">
      <div className="profile-grid">
        <div className="profile-card">
          <h2 className="profile-title">👤 Perfil</h2>

          <div className="profile-split">
            <div className="profile-box equal-box">
              <div className="avatar-box">
                {userPhoto ? (
                  <img src={userPhoto} alt="avatar" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">{initial}</div>
                )}
              </div>

              <label className="upload-btn">
                {uploading ? "Subiendo..." : "📸 Subir foto"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  hidden
                  disabled={uploading}
                />
              </label>
            </div>

            <p className="motivation-text">{getMotivationMessage()}</p>

            <div className="profile-box equal-box">
              <div className="profile-info">
                <p>
                  <strong>Nombre:</strong> {studentName || "Estudiante"}
                </p>
                <p>
                  <strong>Correo:</strong> {userEmail}
                </p>
              </div>

              {!editing ? (
                <button onClick={() => setEditing(true)} className="edit-btn">
                  ✏️ Editar nombre
                </button>
              ) : (
                <>
                  <input
                    className="input-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nuevo nombre"
                  />
                  <div className="btn-group">
                    <button onClick={handleSave} className="save-btn">
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="cancel-btn"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2 className="profile-title">🏆 Tu posición</h2>

          <div className="position-box">
            <p className="position-number">#{rankingPosition || "-"}</p>
            <p>Vas excelente 🚀</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;