'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// Mapeamento de nomes de ícones para assets 3D do Fluent Emoji (Microsoft)
// Usando a CDN oficial do GitHub para garantir alta resolução e carregamento rápido
export const FLUENT_3D_ICONS: Record<string, string> = {
  // --- ESSENCIAIS ---
  'food': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hamburger/3D/hamburger_3d.png',
  'home': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/House/3D/house_3d.png',
  'car': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Automobile/3D/automobile_3d.png',
  'health': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hospital/3D/hospital_3d.png',
  'education': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Graduation%20cap/3D/graduation_cap_3d.png',
  'game': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Video%20game/3D/video_game_3d.png',
  'shopping': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shopping%20bags/3D/shopping_bags_3d.png',
  'work': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Briefcase/3D/briefcase_3d.png',
  'investment': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Chart%20increasing/3D/chart_increasing_3d.png',
  'leisure': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Party%20popper/3D/party_popper_3d.png',
  'travel': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Airplane/3D/airplane_3d.png',
  'gift': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wrapped%20gift/3D/wrapped_gift_3d.png',
  'bills': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Receipt/3D/receipt_3d.png',
  'salary': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Money%20with%20wings/3D/money_with_wings_3d.png',
  'savings': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Coin/3D/coin_3d.png',
  'pet': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dog%20face/3D/dog_face_3d.png',
  'personal': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Barber%20pole/3D/barber_pole_3d.png',
  'cleaning': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Soap/3D/soap_3d.png',
  'gym': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dumbbell/3D/dumbbell_3d.png',
  
  // --- NOVAS CATEGORIAS ---
  'internet': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Globe%20with%20meridians/3D/globe_with_meridians_3d.png',
  'streaming': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Television/3D/television_3d.png',
  'beauty': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Lipstick/3D/lipstick_3d.png',
  'maintenance': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hammer%20and%20wrench/3D/hammer_and_wrench_3d.png',
  'pharmacy': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pill/3D/pill_3d.png',
  'rent': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Building%20construction/3D/building_construction_3d.png',
  'coffee': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hot%20beverage/3D/hot_beverage_3d.png',
  'pizza': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pizza/3D/pizza_3d.png',
  'taxes': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bank/3D/bank_3d.png',
  'bonus': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Money-mouth%20face/3D/money-mouth_face_3d.png',
  'clothing': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/T-shirt/3D/t-shirt_3d.png',
  'other': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png',

  // --- LEGADO / ALIASES ---
  'utensils': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hamburger/3D/hamburger_3d.png',
  'shopping-bag': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shopping%20bags/3D/shopping_bags_3d.png',
  'receipt': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Receipt/3D/receipt_3d.png',
  'graduation-cap': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Graduation%20cap/3D/graduation_cap_3d.png',
  'briefcase': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Briefcase/3D/briefcase_3d.png',
  'trending-up': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Chart%20increasing/3D/chart_increasing_3d.png',
  'gamepad-2': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Video%20game/3D/video_game_3d.png',
  'shirt': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/T-shirt/3D/t-shirt_3d.png',
  'heart-pulse': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hospital/3D/hospital_3d.png',
  'smartphone': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Mobile%20phone/3D/mobile_phone_3d.png',
  'paw-print': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dog%20face/3D/dog_face_3d.png',
  'laptop': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Laptop/3D/laptop_3d.png',
  'plane': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Airplane/3D/airplane_3d.png',
  'piggy-bank': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Piggy%20bank/3D/piggy_bank_3d.png',
  'dumbbell': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dumbbell/3D/dumbbell_3d.png',
  'wallet': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wallet/3D/wallet_3d.png',
  'zap': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/High%20voltage/3D/high_voltage_3d.png',
  'music': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Musical%20notes/3D/musical_notes_3d.png',
  'camera': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Camera/3D/camera_3d.png',
  'trophy': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Trophy/3D/trophy_3d.png',
  'gem': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Gem%20stone/3D/gem_stone_3d.png',
  'star': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star/3D/star_3d.png',
  'sparkles': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png',
  'circle-dot': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/3D/sparkles_3d.png',
};

interface CategoryIcon3DProps {
  icon: string;
  size?: number;
  className?: string;
}

export default function CategoryIcon3D({ icon, size = 64, className }: CategoryIcon3DProps) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = FLUENT_3D_ICONS[icon] || FLUENT_3D_ICONS['other'];
  const fallbackUrl = FLUENT_3D_ICONS['other'];

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <img 
        src={imgError ? fallbackUrl : iconUrl} 
        alt={icon}
        width={size}
        height={size}
        className="object-contain drop-shadow-xl"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
