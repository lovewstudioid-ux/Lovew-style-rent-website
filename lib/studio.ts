/**
 * LOVEW Studio umbrella — shared config for the (studio) mockup pages.
 * Editorial placeholder photography (Unsplash) — swap for brand shoots later.
 */

export const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=85&auto=format&fit=crop`;

export const PHOTO = {
  maroonGown: "1568252542512-9fe8fe9c87bb",
  whiteDress: "1613424935149-c8efd5c41e91",
  grayGown: "1547697933-66bcb20f114a",
  sofaDress: "1763336016192-c7b62602e993",
  blazer: "1629922947773-ad0eff4ad420",
  spaceStudio: "1515511856280-7b23f68d2996",
  spaceRoom: "1676806022089-0a235ffbfb48",
  spaceLounge: "1775123688288-531311546aac",
  spaceWarm: "1629867218251-92a5eb8cd7aa",
  inviteSuite: "1633037773384-27d7ac0491e7",
  inviteCard: "1509316554658-04f9287cdb78",
  invitePaper: "1612611450433-360c82a57e01",
  inviteFlat: "1738898179451-b5fc497f9f8e",
  rack: "1603400521630-9f2de124b33b",
  boutique: "1441984904996-e0b6ba687e04",
  coatRack: "1604882767135-b41fac508fff",
  shoot1: "1758613653843-87c253aea8cd",
  shoot2: "1758613654707-8bdab92f711d",
  shoot3: "1758613655724-233871324ba6",
  beauty1: "1715177092963-d342663a8350",
  beauty2: "1665989780153-2af3ae283b10",
  beauty3: "1758207573536-fa392d6fed8b",
} as const;

export interface StudioService {
  key: string;
  name: string;
  tagline: string;
  href: string;
  photo: string;
}

/** The six services — drives the umbrella nav, the services grid, and the footer. */
export const SERVICES: StudioService[] = [
  { key: "discover", name: "Style ID", tagline: "Discover your colours & fit", href: "/discover", photo: PHOTO.beauty2 },
  { key: "style", name: "LOVEW Style", tagline: "Rent & shop the look", href: "/style", photo: PHOTO.maroonGown },
  { key: "spaces", name: "LOVEW Spaces", tagline: "Studios & venues to book", href: "/spaces", photo: PHOTO.spaceStudio },
  { key: "styling", name: "LOVEW Styling", tagline: "Personal styling", href: "/styling", photo: PHOTO.rack },
  { key: "production", name: "LOVEW Production", tagline: "Photo & video", href: "/production", photo: PHOTO.shoot2 },
  { key: "digitals", name: "LOVEW Digitals", tagline: "Wedding invitations", href: "/invitations", photo: PHOTO.inviteSuite },
];
