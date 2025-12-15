"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Music, Users, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/firebase/auth"
import { toast } from "sonner"

// Array of countries
const COUNTRIES = [
  { code: "AF", name: "Afganistán" },
  { code: "AL", name: "Albania" },
  { code: "DE", name: "Alemania" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AQ", name: "Antártida" },
  { code: "AG", name: "Antigua y Barbuda" },
  { code: "AN", name: "Antillas Neerlandesas" },
  { code: "SA", name: "Arabia Saudí" },
  { code: "DZ", name: "Argelia" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaiyán" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahréin" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Bielorrusia" },
  { code: "BE", name: "Bélgica" },
  { code: "BZ", name: "Belice" },
  { code: "BJ", name: "Benín" },
  { code: "BM", name: "Bermudas" },
  { code: "BT", name: "Bhután" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia y Herzegovina" },
  { code: "BW", name: "Botsuana" },
  { code: "BR", name: "Brasil" },
  { code: "BN", name: "Brunéi" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Camboya" },
  { code: "CM", name: "Camerún" },
  { code: "CA", name: "Canadá" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CY", name: "Chipre" },
  { code: "VA", name: "Ciudad del Vaticano" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoras" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo, República Democrática del" },
  { code: "KR", name: "Corea, República de" },
  { code: "KP", name: "Corea, República Popular Democrática de" },
  { code: "CI", name: "Costa de Marfil" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croacia" },
  { code: "CU", name: "Cuba" },
  { code: "DK", name: "Dinamarca" },
  { code: "DM", name: "Dominica" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egipto" },
  { code: "SV", name: "El Salvador" },
  { code: "AE", name: "Emiratos Árabes Unidos" },
  { code: "ER", name: "Eritrea" },
  { code: "SK", name: "Eslovaquia" },
  { code: "SI", name: "Eslovenia" },
  { code: "ES", name: "España" },
  { code: "US", name: "Estados Unidos de América" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Etiopía" },
  { code: "FJ", name: "Fiji" },
  { code: "PH", name: "Filipinas" },
  { code: "FI", name: "Finlandia" },
  { code: "FR", name: "Francia" },
  { code: "GA", name: "Gabón" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GD", name: "Granada" },
  { code: "GR", name: "Grecia" },
  { code: "GL", name: "Groenlandia" },
  { code: "GP", name: "Guadalupe" },
  { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" },
  { code: "GF", name: "Guayana Francesa" },
  { code: "GN", name: "Guinea" },
  { code: "GQ", name: "Guinea Ecuatorial" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haití" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungría" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IQ", name: "Irak" },
  { code: "IR", name: "Irán" },
  { code: "IE", name: "Irlanda" },
  { code: "IS", name: "Islandia" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italia" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japón" },
  { code: "JO", name: "Jordania" },
  { code: "KZ", name: "Kazajstán" },
  { code: "KE", name: "Kenia" },
  { code: "KG", name: "Kirguistán" },
  { code: "KI", name: "Kiribati" },
  { code: "KW", name: "Kuwait" },
  { code: "LA", name: "Laos" },
  { code: "LS", name: "Lesoto" },
  { code: "LV", name: "Letonia" },
  { code: "LB", name: "Líbano" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libia" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lituania" },
  { code: "LU", name: "Luxemburgo" },
  { code: "MO", name: "Macao" },
  { code: "MK", name: "Macedonia" },
  { code: "MG", name: "Madagascar" },
  { code: "MY", name: "Malasia" },
  { code: "MW", name: "Malaui" },
  { code: "MV", name: "Maldivas" },
  { code: "ML", name: "Malí" },
  { code: "MT", name: "Malta" },
  { code: "MA", name: "Marruecos" },
  { code: "MQ", name: "Martinica" },
  { code: "MU", name: "Mauricio" },
  { code: "MR", name: "Mauritania" },
  { code: "YT", name: "Mayotte" },
  { code: "MX", name: "México" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldavia" },
  { code: "MC", name: "Mónaco" },
  { code: "MN", name: "Mongolia" },
  { code: "MS", name: "Montserrat" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Níger" },
  { code: "NG", name: "Nigeria" },
  { code: "NU", name: "Niue" },
  { code: "NF", name: "Norfolk Island" },
  { code: "NO", name: "Noruega" },
  { code: "NC", name: "Nueva Caledonia" },
  { code: "NZ", name: "Nueva Zelanda" },
  { code: "OM", name: "Omán" },
  { code: "NL", name: "Países Bajos" },
  { code: "PK", name: "Pakistán" },
  { code: "PW", name: "Palaos" },
  { code: "PA", name: "Panamá" },
  { code: "PG", name: "Papúa Nueva Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Perú" },
  { code: "PN", name: "Pitcairn" },
  { code: "PF", name: "Polinesia Francesa" },
  { code: "PL", name: "Polonia" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" },
  { code: "GB", name: "Reino Unido" },
  { code: "CF", name: "República Centroafricana" },
  { code: "CZ", name: "República Checa" },
  { code: "DO", name: "República Dominicana" },
  { code: "RE", name: "Reunión" },
  { code: "RW", name: "Ruanda" },
  { code: "RO", name: "Rumanía" },
  { code: "RU", name: "Rusia" },
  { code: "EH", name: "Sahara Occidental" },
  { code: "WS", name: "Samoa" },
  { code: "AS", name: "Samoa Americana" },
  { code: "KN", name: "San Cristóbal y Nieves" },
  { code: "SM", name: "San Marino" },
  { code: "PM", name: "San Pedro y Miquelón" },
  { code: "VC", name: "San Vicente y las Granadinas" },
  { code: "SH", name: "Santa Helena" },
  { code: "LC", name: "Santa Lucía" },
  { code: "ST", name: "Santo Tomé y Príncipe" },
  { code: "SN", name: "Senegal" },
  { code: "CS", name: "Serbia y Montenegro" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leona" },
  { code: "SG", name: "Singapur" },
  { code: "SY", name: "Siria" },
  { code: "SO", name: "Somalia" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SZ", name: "Suazilandia" },
  { code: "ZA", name: "Sudáfrica" },
  { code: "SD", name: "Sudán" },
  { code: "SE", name: "Suecia" },
  { code: "CH", name: "Suiza" },
  { code: "SR", name: "Surinam" },
  { code: "TH", name: "Tailandia" },
  { code: "TW", name: "Taiwán" },
  { code: "TZ", name: "Tanzania" },
  { code: "TJ", name: "Tayikistán" },
  { code: "TF", name: "Territorios Australes Franceses" },
  { code: "IO", name: "Territorio Británico del Océano Índico" },
  { code: "TL", name: "Timor Oriental" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad y Tobago" },
  { code: "TN", name: "Túnez" },
  { code: "TM", name: "Turkmenistán" },
  { code: "TR", name: "Turquía" },
  { code: "TV", name: "Tuvalu" },
  { code: "UA", name: "Ucrania" },
  { code: "UG", name: "Uganda" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistán" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "WF", name: "Wallis y Futuna" },
  { code: "YE", name: "Yemen" },
  { code: "DJ", name: "Yibuti" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabue" },
];

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    // Field validation
    if (!name || !country || !email || !password || !confirmPassword) {
      setError("Complete todos los datos");
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create user with Firebase
      const { user, idToken } = await signUp(email, password, name);

      // After successful Firebase signup, create user profile in backend
      const userProfileData = {
        firebaseUid: user.uid,
        name: name,
        country: country,
        email: user.email,
      };

      // Send user profile data to backend with idToken
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_USER_PROFILE_URL}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(userProfileData)
      });

      // Check if the profile creation was successful
      if (!profileResponse.ok) {
        // If backend profile creation failed, we might want to handle this based on requirements
        // For now, we'll show a success message but log the error
        console.error('Error creating user profile in backend:', await profileResponse.text());
      }

      // Show success notification
      toast.success("Cuenta creada con éxito");
      
      // Redirect to home page after successful registration
      router.push("/");
    } catch (err) {
      console.error('Registration error:', err);
      // Check for Firebase specific error codes
      if (err instanceof Error && err.message.includes('auth/email-already-in-use')) {
        setError("Esta cuenta ya está en uso");
      } else if (err instanceof Error && err.message.includes('auth/invalid-email')) {
        setError("Correo electrónico inválido");
      } else if (err instanceof Error && err.message.includes('auth/weak-password')) {
        setError("La contraseña es muy débil");
      } else {
        // Display generic error message for other auth errors
        setError("Error al crear cuenta");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Handle key press for registration
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.currentTarget.tagName !== 'SELECT') {
      handleRegister();
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-36 h-36 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter text-balance">
              FRIDAY NIGHT
            </h1>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter mb-4 animate-pulse-glow">
            FUNKIN'
          </h2>
          <div className="flex items-center justify-center gap-2 text-accent font-bold text-xl">
            <Users className="w-6 h-6" />
            <span>MULTIPLAYER</span>
          </div>
        </div>

        {/* Registration form */}
        <div className="w-full max-w-md bg-card/50 backdrop-blur-sm border-4 border-primary/30 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
          <h3 className="text-3xl font-black text-center mb-6 text-foreground">REGISTRARSE</h3>

          {error && (
            <div className="mb-4 p-3 bg-destructive/20 border border-destructive rounded-md flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">NOMBRE</label>
              <Input
                type="text"
                placeholder="Ingresa tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 text-lg font-bold border-2 border-primary/50 focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">PAÍS</label>
              <Select value={country} onValueChange={setCountry} disabled={isLoading}>
                <SelectTrigger className="h-14 text-lg font-bold border-2 border-primary/50 focus:border-primary">
                  <SelectValue placeholder="Selecciona tu país" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((countryOption) => (
                    <SelectItem key={countryOption.code} value={countryOption.code}>
                      {countryOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">CORREO ELECTRÓNICO</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 text-lg font-bold border-2 border-secondary/50 focus:border-secondary"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">CONTRASEÑA</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 text-lg font-bold border-2 border-primary/50 focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">CONFIRMAR CONTRASEÑA</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 text-lg font-bold border-2 border-primary/50 focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-xl font-black tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-primary-foreground/20 shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  CREANDO CUENTA...
                </>
              ) : (
                <>
                  CREAR CUENTA
                  <ArrowRight className="w-6 h-6 ml-2" />
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 font-bold">¿Ya tienes cuenta? <span className="text-primary cursor-pointer" onClick={() => router.push("/login")}>Inicia sesión</span></p>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary/30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-secondary/30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-primary/30" />
    </div>
  )
}