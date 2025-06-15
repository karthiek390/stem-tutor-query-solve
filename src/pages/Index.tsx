
import Header from "@/components/Header";

const Index = () => {
  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)'
      }}
    >
      <Header />
      
      {/* Main Content with top padding for fixed header */}
      <main className="pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold">
                Welcome to{" "}
                <span style={{ color: 'var(--theme-accent)' }}>
                  Your App
                </span>
              </h1>
              <p 
                className="text-lg md:text-xl max-w-2xl mx-auto"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Experience the power of adaptive theming with our customizable darkness control. 
                Adjust the theme to match your preferences and environment.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  title: "🎨 Custom Themes",
                  description: "Adjust darkness levels from 0% to 100% with smooth transitions"
                },
                {
                  title: "💾 Auto Save",
                  description: "Your theme preferences are automatically saved to local storage"
                },
                {
                  title: "⚡ Quick Presets",
                  description: "Choose from Light, Auto, Dim, or Dark presets instantly"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl border transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-border)'
                  }}
                >
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p style={{ color: 'var(--theme-text-muted)' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-12">
              <p 
                className="text-sm"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Click the "Theme" button in the header to customize your experience
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
