import { API_BASE } from "../utils/constants";

function PetCard({ pet, onEdit, onDelete }) {
  const imageUrl = pet.image
    ? pet.image.startsWith("http")
      ? pet.image
      : `${API_BASE}/${pet.image}`
    : null;

  return (
    <article className="pet-card">
      {imageUrl ? <img src={imageUrl} alt={pet.name} className="pet-image" /> : null}
      <h3>{pet.name}</h3>
      <p>
        <strong>Breed:</strong> {pet.breed}
      </p>
      <p>
        <strong>Age:</strong> {pet.age}
      </p>
      <p>{pet.description}</p>
      <div className="action-row">
        {onEdit ? (
          <button type="button" onClick={() => onEdit(pet)}>
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button type="button" className="btn-danger" onClick={() => onDelete(pet.id)}>
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default PetCard;
