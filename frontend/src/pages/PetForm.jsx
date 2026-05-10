import { useEffect, useState, useRef } from "react";
import { API_BASE } from "../utils/constants";

const emptyForm = {
  name: "",
  species: "",
  breed: "",
  age: "",
  gender: "Male",
  is_vaccinated: "No",
  description: "",
  tags: "",
};

function PetForm({ selectedPet, onSubmit, onCancel, isOpen, onClose }) {
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedPet) {
      setFormData({
        name: selectedPet.name || "",
        species: selectedPet.species || "",
        breed: selectedPet.breed || "",
        age: selectedPet.age || "",
        gender: selectedPet.gender || "Male",
        is_vaccinated: selectedPet.is_vaccinated || "No",
        description: selectedPet.description || "",
        tags: selectedPet.tags || "",
      });
      setImageFile(null);
      setImagePreview(selectedPet.image || "");
      return;
    }
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview("");
  }, [selectedPet]);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("species", formData.species);
    data.append("breed", formData.breed);
    data.append("age", formData.age);
    data.append("gender", formData.gender);
    data.append("is_vaccinated", formData.is_vaccinated);
    data.append("description", formData.description);
    data.append("tags", formData.tags);

    if (imageFile) {
      data.append("image", imageFile);
    } else if (selectedPet && selectedPet.image) {
      data.append("existing_image", selectedPet.image);
    }

    onSubmit(data);

    if (!selectedPet) {
      setFormData(emptyForm);
      setImageFile(null);
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!isOpen) return null;

  const resolvePreview = (src) => {
    if (!src) return "";
    if (src.startsWith("blob:") || src.startsWith("http")) return src;
    return `${API_BASE}/${src}`;
  };

  return (
    <div className="pet-modal-overlay" onClick={onClose}>
      <div className="pet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pet-modal-header">
          <h3>{selectedPet ? "Edit Pet" : "Add New Pet"}</h3>
          <button type="button" className="pet-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="pet-modal-form">
          <input name="name" placeholder="Pet Name" value={formData.name} onChange={handleChange} required />
          <select name="species" value={formData.species} onChange={handleChange} required>
            <option value="">Select Species</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Other">Other</option>
          </select>
          <input name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age (in months)" value={formData.age} onChange={handleChange} min="0" required />
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select name="is_vaccinated" value={formData.is_vaccinated} onChange={handleChange} required>
            <option value="No">Not Vaccinated</option>
            <option value="Yes">Vaccinated</option>
          </select>
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={3} />
          <input name="tags" placeholder="Tags (comma-separated, e.g. Friendly, Playful)" value={formData.tags} onChange={handleChange} />
          <label className="pet-file-label">
            <span>Pet Photo</span>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
          </label>
          {imagePreview ? (
            <img src={resolvePreview(imagePreview)} alt="Preview" className="pet-modal-preview" />
          ) : null}
          <div className="action-row">
            <button type="submit">{selectedPet ? "Update Pet" : "Add Pet"}</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PetForm;
