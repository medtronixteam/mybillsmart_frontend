import React, { useEffect } from "react";

const GoogleTranslateWidget = () => {
  useEffect(() => {
    // Agar pahle load ho chuka hai to dubara na karein
    if (window.googleTranslateLoaded) return;

    // Check for existing script
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateInit";
      script.async = true;
      script.defer = true;
      script.onerror = (e) => {
        console.error("Google Translate script failed to load", e);
      };
      document.head.appendChild(script);
    }

    // Safely initialize after script is loaded
    window.googleTranslateInit = () => {
      try {
        const element = document.getElementById("google_translate_element");
        if (!element) {
          console.warn("Translate element not found in DOM");
          return;
        }

        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,es", // Only English and Spanish
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );

        window.googleTranslateLoaded = true;
      } catch (err) {
        console.error("Failed to initialize Google Translate", err);
      }
    };

    // Cleanup function
    return () => {
      delete window.googleTranslateInit;
      delete window.googleTranslateLoaded;
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{
        display: "block",
        width: "max-content",
        marginBottom: "10px",
        textAlign: "center",
      }}
    ></div>
  );
};

export default GoogleTranslateWidget;