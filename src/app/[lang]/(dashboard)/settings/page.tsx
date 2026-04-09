import { getDictionary } from "@/lib/get-dictionary";
import SettingsView from "@/components/dashboard/profile/SettingsView";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Locale } from "@/i18n-config";

export default async function SettingsPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${lang}/login`);
  }

  // Fetch fresh user data from DB to ensure username and image are accurate
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      name: true, 
      username: true, 
      image: true 
    }
  });

  return (
    <SettingsView 
      lang={lang} 
      dict={dict} 
      user={{
        ...session.user,
        name: dbUser?.name || session.user.name,
        username: dbUser?.username || "",
        image: dbUser?.image || session.user.image,
      } as any}
    />
  );
}
