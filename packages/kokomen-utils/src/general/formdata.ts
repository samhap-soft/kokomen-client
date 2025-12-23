function generateFormData(data: Record<string, any>): FormData {
  const formData = new FormData();
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key) && data[key]) {
      if (data[key] instanceof FileList) {
        for (const file of Array.from(data[key])) {
          formData.append(key, file);
        }
      } else {
        formData.append(key, data[key]);
      }
    }
  }
  return formData;
}

export { generateFormData };
