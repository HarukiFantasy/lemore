import { useState } from 'react';
import { Button } from '~/common/components/ui/button';
import { Card } from '~/common/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/common/components/ui/select';
import { X, MapPin, Clock, Phone, ExternalLink } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'centers' | 'tax';
  onSelectCenter?: (center: { name: string; address: string }) => void;
}

const donationCenters = {
  Thailand: [
    {
      name: "Goodwill Thailand",
      address: "123 Silom Road, Bangrak, Bangkok 10500",
      phone: "+66 2 123 4567",
      hours: "Mon-Sat: 9:00 AM - 6:00 PM",
      website: "https://goodwill.or.th",
      accepts: ["Clothing", "Electronics", "Household items"]
    },
    {
      name: "Salvation Army Thailand",
      address: "456 Sukhumvit Road, Watthana, Bangkok 10110",
      phone: "+66 2 234 5678", 
      hours: "Daily: 8:00 AM - 5:00 PM",
      website: "https://salvationarmy.or.th",
      accepts: ["Furniture", "Clothing", "Books", "Toys"]
    },
    {
      name: "Thai Red Cross Society",
      address: "789 Henri Dunant Road, Pathumwan, Bangkok 10330",
      phone: "+66 2 256 4031",
      hours: "Mon-Fri: 8:30 AM - 4:30 PM",
      website: "https://redcross.or.th",
      accepts: ["Medical supplies", "Clothing", "Non-perishable food"]
    },
    {
      name: "Mirror Foundation",
      address: "321 Ratchadamnoen Road, Chiang Mai 50200",
      phone: "+66 53 123 456",
      hours: "Mon-Fri: 9:00 AM - 5:00 PM",
      website: "https://mirrorfoundation.org",
      accepts: ["Educational materials", "Clothing", "Electronics"]
    }
  ],
  Korea: [
    {
      name: "Beautiful Store (아름다운가게)",
      address: "123 Gangnam-daero, Gangnam-gu, Seoul 06292",
      phone: "+82 2 123 4567",
      hours: "Daily: 10:00 AM - 8:00 PM", 
      website: "https://beautifulstore.org",
      accepts: ["Clothing", "Books", "Household items", "Electronics"]
    },
    {
      name: "Salvation Army Korea",
      address: "456 Myeongdong-gil, Jung-gu, Seoul 04563",
      phone: "+82 2 234 5678",
      hours: "Mon-Sat: 9:00 AM - 6:00 PM",
      website: "https://salvationarmy.or.kr", 
      accepts: ["Furniture", "Clothing", "Kitchen items"]
    },
    {
      name: "Korea Red Cross",
      address: "789 Sejong-daero, Jung-gu, Seoul 04519",
      phone: "+82 2 3705 3700",
      hours: "Mon-Fri: 9:00 AM - 6:00 PM",
      website: "https://redcross.or.kr",
      accepts: ["Emergency supplies", "Clothing", "Medical equipment"]
    },
    {
      name: "Community Chest of Korea",
      address: "321 Teheran-ro, Gangnam-gu, Seoul 06292", 
      phone: "+82 2 987 6543",
      hours: "Mon-Fri: 9:00 AM - 5:00 PM",
      website: "https://chest.or.kr",
      accepts: ["Educational materials", "Toys", "Sports equipment"]
    }
  ]
};

const taxInfo = {
  Thailand: {
    title: "Tax Deductions for Donations in Thailand",
    content: [
      "🧾 Keep donation receipts from registered charities",
      "💰 Deduct up to 10% of annual income for charitable donations",
      "🏛️ Must donate to organizations approved by the Ministry of Finance",
      "📋 Include donations in your annual tax return (Por Ngor Dor 90/91)",
      "✅ Popular eligible organizations: Thai Red Cross, Foundation for Slum Child Care, Mirror Foundation"
    ],
    note: "Consult with a Thai tax advisor for specific guidance on your situation."
  },
  Korea: {
    title: "Tax Deductions for Donations in Korea",
    content: [
      "🧾 Keep official donation receipts (기부금영수증)",
      "💰 Deduct up to 100% of income for certain categories",
      "🏛️ Must donate to registered non-profit organizations",
      "📋 Report donations during annual tax settlement (연말정산)",
      "✅ Eligible organizations include Beautiful Store, Korean Red Cross, religious institutions"
    ],
    note: "Tax benefits vary by organization type. Consult Korean tax regulations for details."
  }
};

export function DonationModal({ isOpen, onClose, type, onSelectCenter }: DonationModalProps) {
  const [selectedCountry, setSelectedCountry] = useState<'Thailand' | 'Korea'>('Thailand');
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCenter = (center: any) => {
    setSelectedCenter(center.name);
    if (onSelectCenter) {
      onSelectCenter({ name: center.name, address: center.address });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl font-semibold">
            {type === 'centers' ? 'Donation Centers' : 'Tax Information'}
          </h2>
          <Button className="bg-zinc-50 hover:bg-white border border-gray-200 hover:border-gray-300 text-zinc-700 hover:text-zinc-800 px-8 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
          {/* Country Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Country:
            </label>
            <Select value={selectedCountry} onValueChange={(value) => setSelectedCountry(value as 'Thailand' | 'Korea')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Thailand">🇹🇭 Thailand</SelectItem>
                <SelectItem value="Korea">🇰🇷 Korea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'centers' ? (
            <div className="space-y-4">
              {donationCenters[selectedCountry].map((center, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{center.name}</h3>
                    <div className="flex gap-2">
                      {onSelectCenter && (
                        <Button 
                          className={selectedCenter === center.name ? "bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200" : "bg-zinc-50 hover:bg-white border border-gray-200 hover:border-gray-300 text-zinc-700 hover:text-zinc-800 px-8 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"} 
                          size="sm" 
                          onClick={() => handleSelectCenter(center)}
                        >
                          {selectedCenter === center.name ? 'Selected' : 'Select'}
                        </Button>
                      )}
                      {center.website && (
                        <Button className="bg-zinc-50 hover:bg-white border border-gray-200 hover:border-gray-300 text-zinc-700 hover:text-zinc-800 px-8 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200" size="sm" asChild>
                          <a href={center.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Visit
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{center.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{center.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{center.hours}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">Accepts: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {center.accepts.map((item, i) => (
                        <span key={i} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {taxInfo[selectedCountry].title}
              </h3>
              <div className="space-y-3">
                {taxInfo[selectedCountry].content.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-lg">{item.split(' ')[0]}</span>
                    <span className="text-gray-700">{item.substring(item.indexOf(' ') + 1)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> {taxInfo[selectedCountry].note}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}