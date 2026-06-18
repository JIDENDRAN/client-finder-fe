import React, { useState } from 'react';
import { Search, Loader2, Plus, Globe, Phone, MapPin, Star, Check, Download, Copy } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { API_URL } from '../config';

export default function Scanner() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch(`${API_URL}/api/places/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!res.ok) throw new Error('Failed to fetch business list. Make sure the backend is active.');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while searching.');
    } finally {
      setSearching(false);
    }
  };

  const exportCSV = () => {
    if (results.length === 0) return;
    const header = ['Name', 'Phone', 'Rating', 'Reviews', 'Address', 'Website', 'Source'];
    const rows = results.map(b => [
      `"${b.name || ''}"`,
      `"${b.phone || ''}"`,
      b.rating || 0,
      b.reviewsCount || 0,
      `"${b.address || ''}"`,
      `"${b.website || ''}"`,
      `"${b.source || ''}"`
    ]);
    
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `scanner_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setResults([]);
  };

  const exportPDF = () => {
    if (results.length === 0) return;
    const doc = new jsPDF();
    doc.text('Scanner Results', 14, 15);
    
    const tableColumn = ["Name", "Phone", "Rating", "Reviews", "Website"];
    const tableRows = [];

    results.forEach(b => {
      const rowData = [
        b.name,
        b.phone || 'N/A',
        b.rating?.toString() || 'N/A',
        b.reviewsCount?.toString() || '0',
        b.website || 'N/A'
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`scanner_results_${Date.now()}.pdf`);
    setResults([]);
  };

  const copyToClipboard = async () => {
    if (results.length === 0) return;
    const textData = results.map(b => `Name: ${b.name}\nPhone: ${b.phone || 'N/A'}\nRating: ${b.rating || 'N/A'}\nAddress: ${b.address}\n`).join('\n----------------------\n\n');
    try {
      await navigator.clipboard.writeText(textData);
      setResults([]);
    } catch (err) {
      console.error('Failed to copy', err);
      alert('Failed to copy to clipboard.');
    }
  };



  return (
    <div className="scanner-page" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            marginBottom: '24px', 
            alignItems: 'center',
            maxWidth: '800px',
            margin: '0 auto 32px auto'
          }}>
            
            {/* Premium Pill-shaped Search Bar */}
            <form 
              onSubmit={(e) => handleSearch(e, query)} 
              style={{ 
                display: 'flex', 
                width: '100%', 
                background: 'var(--bg-color)', 
                borderRadius: '50px', 
                padding: '6px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ position: 'relative', flex: '1', display: 'flex', alignItems: 'center' }}>
                <Search size={22} style={{ position: 'absolute', left: '20px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search for a specific business (e.g., Plumbers in Coimbatore)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0 20px 0 56px', 
                    height: '54px', 
                    fontSize: '16px', 
                    border: 'none', 
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  padding: '0 32px', 
                  fontSize: '16px', 
                  borderRadius: '40px',
                  height: '54px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
                disabled={searching || !query.trim()}
              >
                {searching ? <Loader2 size={20} style={{ animation: 'spin 2s linear infinite' }} /> : 'Search'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px' }}>
              <div style={{ height: '1px', background: 'var(--border-color)', flex: 1 }}></div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', letterSpacing: '1px' }}>OR</span>
              <div style={{ height: '1px', background: 'var(--border-color)', flex: 1 }}></div>
            </div>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ 
                padding: '16px 40px', 
                fontSize: '16px', 
                borderRadius: '40px', 
                background: 'var(--card-bg)', 
                border: '2px dashed var(--primary-color)',
                color: 'var(--primary-color)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'var(--card-bg)';
                e.currentTarget.style.transform = 'none';
              }}
              disabled={searching}
              onClick={(e) => {
                const suggestions = [
                "Restaurants in Coimbatore",
                "Plumbers in Coimbatore",
                "Dentists in Coimbatore",
                "Gyms in Coimbatore",
                "Real Estate Agents in Coimbatore",
                "Web Designers in Coimbatore",
                "Hospitals in Coimbatore",
                "Electricians in Coimbatore",
                "Spas in Coimbatore",
                "Lawyers in Coimbatore",
                "Caterers in Coimbatore",
                "Event Planners in Coimbatore",
                "Photographers in Coimbatore",
                "Digital Marketing Agencies in Coimbatore",
                "Interior Designers in Coimbatore",
                "Architects in Coimbatore",
                "Boutiques in Coimbatore",
                "Sarees shops in Coimbatore",
                "Travel Agencies in Coimbatore",
                "Hotels in Coimbatore",
                "Automobile Repair in Coimbatore",
                "Bike Service Centers in Coimbatore",
                "IT Companies in Coimbatore",
                "Colleges in Coimbatore",
                "Schools in Coimbatore",
                "Textile Mills in Coimbatore",
                "Hardware Stores in Coimbatore",
                "Furniture Shops in Coimbatore",
                "Jewellery Shops in Coimbatore",
                "Bakeries in Coimbatore",
                "Coffee Shops in Coimbatore",
                "Pest Control in Coimbatore",
                "Cleaning Services in Coimbatore",
                "Security Services in Coimbatore",
                "Advertising Agencies in Coimbatore",
                "Software Companies in Coimbatore",
                "Logistics in Coimbatore",
                "Packers and Movers in Coimbatore",
                "Yoga Classes in Coimbatore",
                "Fitness Centers in Coimbatore",
                "Diagnostic Centers in Coimbatore",
                "Pharmacies in Coimbatore",
                "Pet Shops in Coimbatore",
                "Veterinary Clinics in Coimbatore",
                "Tailors in Coimbatore",
                "Saloons in Coimbatore",
                "Beauty Parlors in Coimbatore",
                "Tattoo Studios in Coimbatore",
                "Driving Schools in Coimbatore",
                "CCTV Installers in Coimbatore",
                "Car Rentals in Coimbatore",
                "Two Wheeler Showrooms in Coimbatore",
                "Car Accessories Shops in Coimbatore",
                "Used Car Dealers in Coimbatore",
                "Opticians in Coimbatore",
                "Ayurvedic Clinics in Coimbatore",
                "Homeopathy Clinics in Coimbatore",
                "Yoga Ashrams in Coimbatore",
                "Astrologers in Coimbatore",
                "Marriage Halls in Coimbatore",
                "Banquet Halls in Coimbatore",
                "Florists in Coimbatore",
                "Gift Shops in Coimbatore",
                "Supermarkets in Coimbatore",
                "Organic Food Stores in Coimbatore",
                "Dry Fruits Shops in Coimbatore",
                "Meat Shops in Coimbatore",
                "Dairy Farms in Coimbatore",
                "Aquariums in Coimbatore",
                "Plant Nurseries in Coimbatore",
                "Musical Instrument Stores in Coimbatore",
                "Dance Classes in Coimbatore",
                "Music Classes in Coimbatore",
                "Language Classes in Coimbatore",
                "Tuition Centers in Coimbatore",
                "Overseas Education Consultants in Coimbatore",
                "Visa Consultants in Coimbatore",
                "Courier Services in Coimbatore",
                "Travel Agencies in Coimbatore",
                "Printing Presses in Coimbatore",
                "Stationery Shops in Coimbatore",
                "Xerox Shops in Coimbatore",
                "Mobile Phone Repair in Coimbatore",
                "Computer Repair Services in Coimbatore",
                "Electronics Stores in Coimbatore",
                "Home Appliance Repair in Coimbatore",
                "RO Water Purifier Dealers in Coimbatore",
                "Solar Panel Dealers in Coimbatore",
                "Building Material Suppliers in Coimbatore",
                "Cement Dealers in Coimbatore",
                "Paint Shops in Coimbatore",
                "Sanitaryware Dealers in Coimbatore",
                "Tiles Showrooms in Coimbatore",
                "Glass Dealers in Coimbatore",
                "Plywood Dealers in Coimbatore",
                "Aluminium Fabricators in Coimbatore",
                "Steel Dealers in Coimbatore",
                "Scrap Dealers in Coimbatore",
                "Gym Equipment Dealers in Coimbatore",
                "Sports Shops in Coimbatore",
                "Bicycle Shops in Coimbatore",
                "Toy Shops in Coimbatore",
                "Baby Products Shops in Coimbatore",
                "Maternity Clinics in Coimbatore",
                "Pediatricians in Coimbatore",
                "Orthopedic Doctors in Coimbatore",
                "Cardiologists in Coimbatore",
                "Neurologists in Coimbatore",
                "Psychiatrists in Coimbatore",
                "Psychologists in Coimbatore",
                "Physiotherapy Clinics in Coimbatore",
                "Acupuncture Clinics in Coimbatore",
                "Fitness Equipment Repair in Coimbatore",
                "Elevator Manufacturers in Coimbatore",
                "Generators Dealers in Coimbatore",
                "Inverter Dealers in Coimbatore",
                "Battery Dealers in Coimbatore",
                "Tyre Shops in Coimbatore",
                "Car Wash in Coimbatore",
                "Mechanics in Coimbatore",
                "Towing Services in Coimbatore",
                "Ambulance Services in Coimbatore",
                "Blood Banks in Coimbatore",
                "Eye Hospitals in Coimbatore",
                "Dental Clinics in Coimbatore",
                "Skin Clinics in Coimbatore",
                "Hair Transplant Clinics in Coimbatore",
                "Weight Loss Centers in Coimbatore",
                "Dietitians in Coimbatore",
                "Nutritionists in Coimbatore",
                "Chartered Accountants in Coimbatore",
                "Tax Consultants in Coimbatore",
                "Auditors in Coimbatore",
                "Insurance Agents in Coimbatore",
                "Mutual Fund Agents in Coimbatore",
                "Stock Brokers in Coimbatore",
                "Real Estate Developers in Coimbatore",
                "Builders in Coimbatore",
                "Property Consultants in Coimbatore",
                "Civil Contractors in Coimbatore",
                "Plumbing Contractors in Coimbatore",
                "Electrical Contractors in Coimbatore",
                "Painting Contractors in Coimbatore",
                "Carpenters in Coimbatore",
                "Waterproofing Contractors in Coimbatore",
                "Roofing Contractors in Coimbatore",
                "Borewell Contractors in Coimbatore",
                "Water Tank Cleaners in Coimbatore",
                "Septic Tank Cleaners in Coimbatore",
                "Housekeeping Services in Coimbatore",
                "Maid Agencies in Coimbatore",
                "Nanny Services in Coimbatore",
                "Old Age Homes in Coimbatore",
                "Orphanages in Coimbatore",
                "NGOs in Coimbatore",
                "Trusts in Coimbatore",
                "Temples in Coimbatore",
                "Churches in Coimbatore",
                "Mosques in Coimbatore",
                "Cemeteries in Coimbatore",
                "Funeral Services in Coimbatore",
                "Astrology Centers in Coimbatore",
                "Vastu Consultants in Coimbatore",
                "Numerologists in Coimbatore",
                "Tarot Readers in Coimbatore",
                "Match Making Services in Coimbatore",
                "Matrimonial Bureaus in Coimbatore",
                "Event Management Companies in Coimbatore",
                "Wedding Planners in Coimbatore",
                "Party Organizers in Coimbatore",
                "Tent House in Coimbatore",
                "Lighting Decorators in Coimbatore",
                "Flower Decorators in Coimbatore",
                "Stage Decorators in Coimbatore",
                "Sound System Providers in Coimbatore",
                "DJ Services in Coimbatore",
                "Orchestra in Coimbatore",
                "Catering Services in Coimbatore",
                "Sweet Shops in Coimbatore",
                "Snacks Shops in Coimbatore",
                "Ice Cream Parlors in Coimbatore",
                "Juice Shops in Coimbatore",
                "Tea Stalls in Coimbatore",
                "Fast Food Centers in Coimbatore",
                "Pizza Outlets in Coimbatore",
                "Burger Shops in Coimbatore",
                "Biryani Centers in Coimbatore",
                "Seafood Restaurants in Coimbatore",
                "Vegetarian Restaurants in Coimbatore",
                "Non-Vegetarian Restaurants in Coimbatore",
                "Multi Cuisine Restaurants in Coimbatore",
                "Buffet Restaurants in Coimbatore",
                "Dhabas in Coimbatore",
                "Food Trucks in Coimbatore",
                "Textile Exporters in Coimbatore",
                "Garment Manufacturers in Coimbatore",
                "Spinning Mills in Coimbatore",
                "Pump Manufacturers in Coimbatore",
                "Motor Manufacturers in Coimbatore",
                "Foundries in Coimbatore",
                "Casting Companies in Coimbatore",
                "CNC Machine Shops in Coimbatore",
                "Lathe Workshops in Coimbatore",
                "Engineering Consultants in Coimbatore",
                "Web Hosting Companies in Coimbatore",
                "Cyber Security Firms in Coimbatore",
                "App Development Companies in Coimbatore",
                "SEO Agencies in Coimbatore",
                "Data Entry Services in Coimbatore",
                "Call Centers in Coimbatore",
                "BPO Companies in Coimbatore",
                "KPO Companies in Coimbatore",
                "Graphic Designers in Coimbatore",
                "Animation Studios in Coimbatore",
                "Recording Studios in Coimbatore",
                "Film Production Houses in Coimbatore",
                "Ad Film Makers in Coimbatore",
                "Modeling Agencies in Coimbatore",
                "Casting Agencies in Coimbatore",
                "Fashion Designers in Coimbatore",
                "Tailoring Institutes in Coimbatore",
                "Beautician Courses in Coimbatore",
                "Makeup Artists in Coimbatore",
                "Bridal Makeup in Coimbatore",
                "Mehendi Artists in Coimbatore",
                "Spa Centers in Coimbatore",
                "Massage Parlors in Coimbatore",
                "Ayurvedic Massage in Coimbatore",
                "Aroma Therapy in Coimbatore",
                "Naturopathy Centers in Coimbatore",
                "Rehabilitation Centers in Coimbatore",
                "De-addiction Centers in Coimbatore",
                "Special Schools in Coimbatore",
                "Blind Schools in Coimbatore",
                "Deaf and Dumb Schools in Coimbatore",
                "Vocational Training Centers in Coimbatore",
                "Skill Development Centers in Coimbatore",
                "Computer Training Institutes in Coimbatore",
                "Spoken English Classes in Coimbatore",
                "IELTS Coaching in Coimbatore",
                "GRE Coaching in Coimbatore",
                "GMAT Coaching in Coimbatore",
                "CAT Coaching in Coimbatore",
                "Bank Exam Coaching in Coimbatore",
                "TNPSC Coaching in Coimbatore",
                "UPSC Coaching in Coimbatore",
                "NEET Coaching in Coimbatore",
                "JEE Coaching in Coimbatore",
                "CA Coaching in Coimbatore",
                "CS Coaching in Coimbatore",
                "CMA Coaching in Coimbatore",
                "Typing Institutes in Coimbatore",
                "Shorthand Institutes in Coimbatore",
                "Art Classes in Coimbatore",
                "Drawing Classes in Coimbatore",
                "Painting Classes in Coimbatore",
                "Handwriting Classes in Coimbatore",
                "Abacus Classes in Coimbatore",
                "Vedic Maths Classes in Coimbatore",
                "Chess Classes in Coimbatore",
                "Swimming Classes in Coimbatore",
                "Karate Classes in Coimbatore",
                "Kung Fu Classes in Coimbatore",
                "Taekwondo Classes in Coimbatore",
                "Judo Classes in Coimbatore",
                "Boxing Classes in Coimbatore",
                "Wrestling Classes in Coimbatore",
                "Gymnastics Classes in Coimbatore",
                "Aerobics Classes in Coimbatore",
                "Zumba Classes in Coimbatore",
                "Salsa Classes in Coimbatore",
                "Bharatanatyam Classes in Coimbatore",
                "Carnatic Music Classes in Coimbatore",
                "Keyboard Classes in Coimbatore",
                "Guitar Classes in Coimbatore",
                "Violin Classes in Coimbatore",
                "Flute Classes in Coimbatore",
                "Drum Classes in Coimbatore",
                "Tabla Classes in Coimbatore",
                "Mridangam Classes in Coimbatore",
                "Vocal Music Classes in Coimbatore",
                "Tailoring Materials Shops in Coimbatore",
                "Embroidery Shops in Coimbatore",
                "Thread Shops in Coimbatore",
                "Button Shops in Coimbatore",
                "Lace Shops in Coimbatore",
                "Zari Shops in Coimbatore",
                "Beads Shops in Coimbatore",
                "Stones Shops in Coimbatore",
                "Artificial Jewellery Shops in Coimbatore",
                "Cosmetics Shops in Coimbatore",
                "Perfume Shops in Coimbatore",
                "Bags Shops in Coimbatore",
                "Luggage Shops in Coimbatore",
                "Umbrella Shops in Coimbatore",
                "Raincoat Shops in Coimbatore",
                "Shoe Shops in Coimbatore",
                "Slipper Shops in Coimbatore",
                "Leather Goods Shops in Coimbatore",
                "Belt Shops in Coimbatore",
                "Wallet Shops in Coimbatore",
                "Cap Shops in Coimbatore",
                "Helmet Shops in Coimbatore",
                "Sunglasses Shops in Coimbatore",
                "Watch Shops in Coimbatore",
                "Clocks Shops in Coimbatore",
                "Wall Clocks Shops in Coimbatore",
                "Table Clocks Shops in Coimbatore",
                "Alarm Clocks Shops in Coimbatore",
                "Smart Watches Shops in Coimbatore",
                "Fitness Bands Shops in Coimbatore",
                "Mobile Accessories Shops in Coimbatore",
                "Computer Accessories Shops in Coimbatore",
                "Laptop Accessories Shops in Coimbatore",
                "Camera Accessories Shops in Coimbatore",
                "TVS Showrooms in Coimbatore",
                "Honda Showrooms in Coimbatore",
                "Yamaha Showrooms in Coimbatore",
                "Suzuki Showrooms in Coimbatore",
                "Bajaj Showrooms in Coimbatore",
                "Hero Showrooms in Coimbatore",
                "KTM Showrooms in Coimbatore",
                "Royal Enfield Showrooms in Coimbatore",
                "Jawa Showrooms in Coimbatore",
                "Maruti Suzuki Showrooms in Coimbatore",
                "Hyundai Showrooms in Coimbatore",
                "Tata Motors Showrooms in Coimbatore",
                "Mahindra Showrooms in Coimbatore",
                "Toyota Showrooms in Coimbatore",
                "Honda Cars Showrooms in Coimbatore",
                "Ford Showrooms in Coimbatore",
                "Chevrolet Showrooms in Coimbatore",
                "Volkswagen Showrooms in Coimbatore",
                "Skoda Showrooms in Coimbatore",
                "Renault Showrooms in Coimbatore",
                "Nissan Showrooms in Coimbatore",
                "Datsun Showrooms in Coimbatore",
                "Fiat Showrooms in Coimbatore",
                "Jeep Showrooms in Coimbatore",
                "Kia Showrooms in Coimbatore",
                "MG Showrooms in Coimbatore",
                "Audi Showrooms in Coimbatore",
                "BMW Showrooms in Coimbatore",
                "Mercedes Benz Showrooms in Coimbatore",
                "Volvo Showrooms in Coimbatore",
                "Jaguar Showrooms in Coimbatore",
                "Land Rover Showrooms in Coimbatore",
                "Porsche Showrooms in Coimbatore",
                "Mini Cooper Showrooms in Coimbatore"
              ];
              const randomQuery = suggestions[Math.floor(Math.random() * suggestions.length)];
              setQuery(randomQuery);
              handleSearch(e, randomQuery);
            }}
          >
            {searching ? 'Scanning Universe...' : '🎲 Scan Random Local Businesses'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

      {/* Results List Card */}
      {results.length > 0 && (
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                Scan Results ({results.length})
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                All scanned results are automatically saved to your Database.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={copyToClipboard}
              >
                <Copy size={14} /> Copy
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={exportCSV}
              >
                <Download size={14} /> Export CSV
              </button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 12px', fontSize: '12px', background: '#dc2626', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={exportPDF}
              >
                <Download size={14} /> Export PDF
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Rating</th>
                  <th>Phone Number</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {results.map((place) => {
                  const hasPhone = !!place.phone;
                  return (
                    <tr key={place.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{place.name}</span>
                          {place.website && (
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '11px', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', textDecoration: 'none' }}
                            >
                              <Globe size={11} /> Website
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} color="var(--warning)" fill="var(--warning)" />
                          <span style={{ fontWeight: 600 }}>{place.rating || 'N/A'}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            ({place.reviewsCount || 0})
                          </span>
                        </div>
                      </td>
                      <td>
                        {hasPhone ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            <Phone size={12} color="var(--success)" />
                            <a
                              href={`https://wa.me/${place.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#fff', textDecoration: 'none' }}
                              title="Message in WhatsApp"
                            >
                              {place.phone}
                            </a>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
                            No Phone Listed
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={12} />
                          {place.address}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && !searching && (
        <div style={{ padding: '64px 32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '16px' }}>
          <Search size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Find Local Business Contacts</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', margin: '8px auto 0' }}>
            Click the "Scan Random Businesses" button above to automatically find and save verified phone numbers and website profiles.
          </p>
        </div>
      )}
    </div>
  );
}
