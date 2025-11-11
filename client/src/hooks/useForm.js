import { useState } from "react";

export function useBugForm(initialValues = { title: "", description: "", status: "open" }) {
  const [formData, setFormData] = useState(initialValues);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.title || !formData.description) {
      setError("All fields are required");
      return false;
    }
    setError("");
    return true;
  };

  const resetForm = () => setFormData(initialValues);

  return { formData, error, handleChange, validate, resetForm };
}
