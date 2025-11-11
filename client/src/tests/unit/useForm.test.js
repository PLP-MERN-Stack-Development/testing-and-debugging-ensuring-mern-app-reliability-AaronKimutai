import { renderHook, act } from "@testing-library/react";
import { useBugForm } from "../../hooks/useForm"; 

describe("useBugForm custom hook", () => {
  test("should initialize with default values", () => {
    const { result } = renderHook(() => useBugForm());
    expect(result.current.formData).toEqual({ title: "", description: "", status: "open" });
  });

  test("should update formData on handleChange", () => {
    const { result } = renderHook(() => useBugForm());

    act(() => {
      result.current.handleChange({ target: { name: "title", value: "Bug in login" } });
    });

    expect(result.current.formData.title).toBe("Bug in login");
  });

  test("should validate correctly when fields are filled", () => {
    const { result } = renderHook(() => useBugForm({ title: "A", description: "B" }));
    let isValid;

    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(true);
    expect(result.current.error).toBe("");
  });

  test("should show error if fields are empty", () => {
    const { result } = renderHook(() => useBugForm({ title: "", description: "" }));
    let isValid;

    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.error).toBe("All fields are required");
  });

  test("should reset form to initial values", () => {
    const { result } = renderHook(() => useBugForm({ title: "Old", description: "Old", status: "open" }));


    act(() => {
      result.current.handleChange({ target: { name: "title", value: "New" } });
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual({ title: "Old", description: "Old", status: "open" });
  });
});
