import { useEffect } from 'react';


const GoogleTranslate = () => {
    useEffect(() => {
      const timer = setInterval(() => {
        if (window.google?.translate && document.getElementById('google_translate_element')) {
          clearInterval(timer);
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
        }
      }, 500);
  
      return () => clearInterval(timer);
    }, []);
  
    return <div id="google_translate_element" style={{ width: '100%', height: '40px' }} />;
  };
  export default GoogleTranslate;