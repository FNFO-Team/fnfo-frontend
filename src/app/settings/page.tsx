"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Settings, Volume2, Music, Palette, User, Save, AlertCircle, Lock, MapPin, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"
import { toast } from "sonner"
import { useUserProfile } from "@/hooks/use-user-profile"

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
  { code: "SH", name: "Santa Elena" },
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

// Array of cities by country (example for major countries)
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "ES": ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia"],
  "US": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"],
  "CO": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
  "MX": ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla"],
  "AR": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"],
  "BR": ["São Paulo", "Río de Janeiro", "Brasilia", "Salvador"],
};

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthContext();
  const {
    profile,
    setProfile,
    audioSettings,
    setAudioSettings,
    isLoading,
    isSaving,
    error,
    updateProfile,
    updatePasswordInFirebase,
    saveAudioSettings
  } = useUserProfile();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Don't render if auth is not initialized
  if (!isInitialized) {
    return null;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleUpdateProfile = async () => {
    // Validation
    if (!profile.name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    if (!profile.country.trim()) {
      toast.error("Por favor seleccione un país");
      return;
    }

    // Only send the specific fields we want to update, not the entire profile object
    await updateProfile({
      name: profile.name.trim(),
      country: profile.country,
      city: profile.city.trim()
    });
  };

  const handleUpdatePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      toast.error("Por favor ingrese su contraseña actual");
      return;
    }
    if (!passwordData.newPassword) {
      toast.error("Por favor ingrese una nueva contraseña");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las nuevas contraseñas no coinciden");
      return;
    }

    try {
      await updatePasswordInFirebase(passwordData);
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar la contraseña";
      toast.error(errorMessage);
    }
  };

  const handleSaveAll = async () => {
    // Update profile first
    await handleUpdateProfile();

    // Update password if fields are filled
    if (passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword) {
      await handleUpdatePassword();
    }

    // Save audio settings
    saveAudioSettings();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold text-primary">Cargando...</div>
      </div>
    );
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

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12">
        <Button
          variant="ghost"
          size="lg"
          className="absolute top-8 left-8 text-xl font-black"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          VOLVER
        </Button>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-500 mt-16">
          <Settings className="w-20 h-20 text-accent mx-auto mb-4 animate-spin-slow" />
          <h2 className="text-5xl md:text-7xl font-black text-accent tracking-tighter mb-4">AJUSTES</h2>
        </div>

        <div className="w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
          {/* User Profile Section */}
          <div className="bg-card/50 backdrop-blur-sm border-4 border-primary/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-black text-foreground">PERFIL DE USUARIO</h3>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/20 border border-destructive rounded-md flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">NOMBRE</Label>
                <Input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12 text-lg font-bold border-2 border-primary/50"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">CORREO ELECTRÓNICO</Label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-12 text-lg font-bold border-2 border-primary/50 bg-muted/50"
                />
              </div>

              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">PAÍS</Label>
                <Select
                  value={profile.country}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, country: value }))}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-12 text-lg font-bold border-2 border-primary/50">
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">CIUDAD</Label>
                <Input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  placeholder={profile.country ? "Selecciona tu ciudad" : "Selecciona un país primero"}
                  className="h-12 text-lg font-bold border-2 border-primary/50"
                  disabled={isSaving || !profile.country || !CITIES_BY_COUNTRY[profile.country]}
                />
                {profile.country && CITIES_BY_COUNTRY[profile.country] && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Ciudades sugeridas:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {CITIES_BY_COUNTRY[profile.country].slice(0, 5).map((city, index) => (
                        <button
                          key={index}
                          type="button"
                          className="text-xs bg-primary/20 hover:bg-primary/30 px-2 py-1 rounded-md"
                          onClick={() => setProfile(prev => ({ ...prev, city }))}
                          disabled={isSaving}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-card/50 backdrop-blur-sm border-4 border-secondary/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-secondary" />
              <h3 className="text-2xl font-black text-foreground">CONTRASEÑA</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">CONTRASEÑA ACTUAL</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="h-12 text-lg font-bold border-2 border-primary/50 pr-12"
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={isSaving}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">NUEVA CONTRASEÑA</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="h-12 text-lg font-bold border-2 border-primary/50 pr-12"
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isSaving}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">CONFIRMAR NUEVA CONTRASEÑA</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="h-12 text-lg font-bold border-2 border-primary/50 pr-12"
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSaving}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="bg-card/50 backdrop-blur-sm border-4 border-accent/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-black text-foreground">AUDIO Y TEMA</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    VOLUMEN DE MÚSICA
                  </Label>
                  <span className="text-lg font-black text-secondary">{audioSettings.musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioSettings.musicVolume}
                  onChange={(e) => setAudioSettings(prev => ({ ...prev, musicVolume: Number(e.target.value) }))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    VOLUMEN DE EFECTOS
                  </Label>
                  <span className="text-lg font-black text-secondary">{audioSettings.sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioSettings.sfxVolume}
                  onChange={(e) => setAudioSettings(prev => ({ ...prev, sfxVolume: Number(e.target.value) }))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>

              <div>
                <Label className="text-sm font-bold text-muted-foreground mb-2">TEMA</Label>
                <Select
                  value={audioSettings.theme}
                  onValueChange={(value) => setAudioSettings(prev => ({ ...prev, theme: value as any }))}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-12 text-lg font-bold border-2 border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            size="lg"
            className="w-full h-16 text-xl font-black tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-primary-foreground/20 shadow-xl transition-all duration-300 hover:scale-105"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mr-2">GUARDANDO...</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6 mr-2" />
                GUARDAR CAMBIOS
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-accent/30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-accent/30" />
    </div>
  )
}