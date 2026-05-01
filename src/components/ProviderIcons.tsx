export function ProviderIcon({ providerId, className }: { providerId: string, className?: string }) {
  switch (providerId) {
    case 'openrouter':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" fill="#2563EB"/>
          <path d="M50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50C80 33.4315 66.5685 20 50 20ZM50 72V28M28 50H72M34.43 34.43L65.57 65.57M34.43 65.57L65.57 34.43" stroke="white" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case 'gemini':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.0003 1.5C12.0003 1.5 12.0003 10.5 21.0003 10.5C21.0003 10.5 12.0003 10.5 12.0003 19.5C12.0003 19.5 12.0003 10.5 3.00024 10.5C3.00024 10.5 12.0003 10.5 12.0003 1.5Z" fill="#1D4ED8"/>
          <path d="M12.0003 1.5C12.0003 1.5 12.0003 10.5 21.0003 10.5C21.0003 10.5 12.0003 10.5 12.0003 19.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.00024 10.5C3.00024 10.5 12.0003 10.5 12.0003 1.5" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.0003 19.5C12.0003 10.5 3.00024 10.5 3.00024 10.5" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'openai':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2057 5.9847 5.9847 0 0 0 3.989-2.9001 6.0557 6.0557 0 0 0-.7388-7.0731zM11.966 22.3168a4.3435 4.3435 0 0 1-3.6669-1.9962l9.0833-5.26v-1.6844l-5.4164-3.125V22.3168zM3.9715 16.5912a4.3388 4.3388 0 0 1-1.025-4.0538l9.1032 5.2341v4.3015L3.9715 16.5912zM5.5028 6.5413a4.3388 4.3388 0 0 1 3.5513-2.1884l-4.5208 7.8576 4.3516 2.5028v-3.3421L5.5028 6.5413zM16.5936 3.9715A4.3482 4.3482 0 0 1 20.65 4.9964l-9.1032-5.2341V-4.5h8.0779l-3.0311 5.2415zM20.3012 17.6534a4.3435 4.3435 0 0 1-3.556-2.1884l4.5255-7.8529-4.3563-2.5028v3.3421l3.3868 9.202z M10.2248 13.4116l-3.2131-1.854.0047-3.7032 3.2084-1.854 3.2037 1.8493.0047 3.708-3.2084 1.854z" />
        </svg>
      );
    case 'anthropic':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.067 15.65h-10.1l5.05-8.747 5.05 8.747zm-11.83 2.062h13.56l-6.78-11.743-6.78 11.743zm4.536 2.228H2.228V2.228h19.544v19.544H9.77z"/>
        </svg>
      );
    case 'github':
    case 'github_copilot':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      );
    case 'cohere':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 22h5l5-10 5 10h5L12 2Z" fill="currentColor" />
        </svg>
      );
    case 'groq':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.8 4.6H5.2A1.6 1.6 0 0 0 3.6 6.2v11.6a1.6 1.6 0 0 0 1.6 1.6h6.4a.8.8 0 0 0 .8-.8V12L18.8 4.6Z" />
        </svg>
      );
    case 'ollama':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Z"/>
           <circle cx="9" cy="10" r="1.5" />
           <circle cx="15" cy="10" r="1.5" />
           <path d="M12 16c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2Z" />
        </svg>
      );
    case 'huggingface':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#FFD21E"/>
           <path d="M8.5 13.5C8.5 13.5 10 15 12 15C14 15 15.5 13.5 15.5 13.5" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
           <circle cx="8" cy="9.5" r="1.5" fill="#4B5563"/>
           <circle cx="16" cy="9.5" r="1.5" fill="#4B5563"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12h8"/>
          <path d="M12 8v8"/>
        </svg>
      );
  }
}
