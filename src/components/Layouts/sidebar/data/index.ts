import * as Icons from "../icons";
import useUserStore from "@/store/useUserStore";

const { promotions, activeAppariteur } = useUserStore.getState();

interface MenuItem {
  title: string;
  icon: any;
  items: never[];
  url: string;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

interface Promotion {
  _id: string;
  niveau: string;
  mention: string;
  orientation?: string;
}

interface AnneeId {
  _id: string;
}

interface Appariteur {
  anneeId: AnneeId;
}

const buildMenuItems = (): MenuSection[] => {
  let navMenu: MenuSection[] = [
    {
      label: "",
      items: [
        {
          title: "Dashboard",
          icon: Icons.HomeIcon,
          items: [],
          url: "/",
        }
      ]
    },
    {
      label: "ETUDIANTS",
      items: promotions ? promotions.map((promotion: Promotion) => ({
          title: `${promotion.niveau} ${promotion.mention} ${promotion.orientation ? `(${promotion.orientation})` : ""}`,
          url: `/etudiants/${promotion._id}-${activeAppariteur?.anneeId._id}`,
          icon: Icons.User,
          items: []
        })
      ) : [],
    },
    {
      label: "INSCRIPTIONS",
      items: promotions ? promotions.map((promotion: Promotion) => ({
          title: `${promotion.niveau} ${promotion.mention} ${promotion.orientation ? `(${promotion.orientation})` : ""}`,
          url: `/inscriptions/${promotion._id}-${activeAppariteur?.anneeId._id}`,
          icon: Icons.FourCircle,
          items: []
        })
      ) : [],
    }
  ]

  return navMenu;
}


export const NAV_DATA = buildMenuItems();
