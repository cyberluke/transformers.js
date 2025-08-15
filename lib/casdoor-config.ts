// Casdoor SDK konfigurace
// Upravte tyto hodnoty podle vaší Casdoor instance

export const casdoorClientConfig = {
  serverUrl: process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL!,
  clientId: process.env.NEXT_PUBLIC_CASDOOR_CLIENT_ID!,
  // clientSecret: process.env.NEXT_PUBLIC_CASDOOR_CLIENT_SECRET,
  organizationName: process.env.NEXT_PUBLIC_CASDOOR_ORGANIZATION!,
  appName: process.env.NEXT_PUBLIC_CASDOOR_APP_NAME!,
  redirectPath: "/callback",
};

// Pomocná funkce pro vytváření URL
export function getCasdoorRedirectUrl(baseUrl: string = "http://localhost:3000") {
  return `${baseUrl}${casdoorClientConfig.redirectPath}`;
}
