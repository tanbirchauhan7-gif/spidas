import { Card } from "@/components/ui/card";
import { Users, Code, Cpu, Brain, Globe } from "lucide-react";

const Team = () => {
  const members = [
    {
      name: "Member 1",
      role: "Hardware & Simulation Lead",
      icon: <Cpu className="w-8 h-8" />,
      responsibilities: [
        "Tinkercad circuit design",
        "Arduino programming",
        "Sensor integration and testing"
      ]
    },
    {
      name: "Member 2",
      role: "Encryption & Security Lead",
      icon: <Code className="w-8 h-8" />,
      responsibilities: [
        "AES encryption implementation",
        "Bluetooth communication protocol",
        "Data security measures"
      ]
    },
    {
      name: "Member 3",
      role: "ML & Classification Lead",
      icon: <Brain className="w-8 h-8" />,
      responsibilities: [
        "Machine learning model development",
        "Human/Animal classification",
        "Feature extraction and training"
      ]
    },
    {
      name: "Member 4",
      role: "Web Development Lead",
      icon: <Globe className="w-8 h-8" />,
      responsibilities: [
        "Website design and development",
        "Real-time dashboard",
        "Google Sheets integration"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Our Team
          </h1>
          <p className="text-xl text-muted-foreground">
            Meet the team behind SPIDAS
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {members.map((member, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-primary w-16 h-16 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  {member.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <ul className="space-y-1">
                    {member.responsibilities.map((resp, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Project Parts Distribution */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Project Parts Distribution</h2>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { part: "Part 1", title: "Tinkercad Simulation", lead: "Member 1" },
              { part: "Part 2", title: "AES Encryption", lead: "Member 2" },
              { part: "Part 3", title: "Website Development", lead: "Member 4" },
              { part: "Part 4", title: "ML Classification", lead: "Member 3" },
              { part: "Part 5", title: "Integration & Testing", lead: "All Members" }
            ].map((item, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-primary font-semibold mb-2">{item.part}</div>
                <div className="font-medium mb-2">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.lead}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Future Scope & Contact */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Future Scope</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">GSM Integration:</strong> SMS alerts for remote locations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">WiFi Module:</strong> Direct internet connectivity (ESP32)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Camera Integration:</strong> Visual verification of intrusions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Advanced ML:</strong> Deep learning for better accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Mobile App:</strong> Dedicated iOS/Android application</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Project Repository</h3>
                <p className="text-muted-foreground">github.com/spidas-project</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">spidas.project@university.edu</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Institution</h3>
                <p className="text-muted-foreground">Your University Name</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Academic Year</h3>
                <p className="text-muted-foreground">2024-2025</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Team;
