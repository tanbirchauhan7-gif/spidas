import { Card } from "@/components/ui/card";
import { Image, Video } from "lucide-react";

const Gallery = () => {
  const categories = [
    {
      title: "Tinkercad Simulations",
      items: [
        { type: "image", title: "Complete Circuit Design", description: "Full schematic with all components" },
        { type: "image", title: "PIR Sensor Configuration", description: "Motion detection setup" },
        { type: "image", title: "Arduino Code Testing", description: "Serial monitor output" },
      ]
    },
    {
      title: "Hardware Implementation",
      items: [
        { type: "image", title: "Breadboard Assembly", description: "Physical circuit setup" },
        { type: "image", title: "Sensor Placement", description: "PIR and vibration sensors" },
        { type: "image", title: "HC-05 Bluetooth Module", description: "Wireless communication setup" },
      ]
    },
    {
      title: "System Testing",
      items: [
        { type: "video", title: "Live Detection Demo", description: "Real-time intrusion detection" },
        { type: "video", title: "Alert System Test", description: "End-to-end system demonstration" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Project Gallery
          </h1>
          <p className="text-xl text-muted-foreground">
            Visual documentation of SPIDAS development and implementation
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-2xl font-bold mb-6">{category.title}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {category.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {item.type === "image" ? (
                        <Image className="w-16 h-16 text-muted-foreground" />
                      ) : (
                        <Video className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Upload Instructions */}
        <Card className="p-8 mt-12 bg-gradient-card">
          <h2 className="text-2xl font-bold mb-4">Adding Your Media</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>• Upload your Tinkercad screenshots to showcase circuit design</p>
            <p>• Add breadboard photos showing physical implementation</p>
            <p>• Include demo videos of the system in action</p>
            <p>• Document sensor testing and calibration process</p>
            <p>• Show before/after comparisons of development stages</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Gallery;
