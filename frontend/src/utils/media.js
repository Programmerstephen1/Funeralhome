export const showLocalImageFallback = (event) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  image.src = "/images/photo-unavailable.svg";
};
