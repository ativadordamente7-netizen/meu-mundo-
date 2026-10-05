import React from 'react';
import {
  Sun,
  Droplets,
  Coffee,
  Sparkles,
  Shirt,
  School,
  Utensils,
  BedDouble,
  Smile,
  Bath,
  UtensilsCrossed,
  Moon,
  GlassWater,
  Apple,
  DoorClosed,
  Bed,
  Gamepad2,
  Palette,
  Music,
  MapPin,
  RefreshCw,
  Frown,
  AlertCircle,
  ShieldAlert,
  BatteryLow,
  Hourglass,
  CheckCircle2,
  XCircle,
  PlusCircle,
  CheckSquare,
  HeartHandshake,
  Ban,
  Calendar,
  Clock,
  MessageSquare,
  Heart,
  User,
  BookOpen,
  HelpCircle,
  Sliders,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Volume2,
  VolumeX,
  Eye,
  ArrowUpDown,
  Download,
  Check,
  X,
  FileText,
  Wind,
  Info,
  Sparkle,
  Search,
  Star,
  Maximize2,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const iconProps = { className, ...(size ? { size } : {}) };

  switch (name) {
    case 'Sun': return <Sun {...iconProps} />;
    case 'Droplets': return <Droplets {...iconProps} />;
    case 'Coffee': return <Coffee {...iconProps} />;
    case 'Sparkles': return <Sparkles {...iconProps} />;
    case 'Shirt': return <Shirt {...iconProps} />;
    case 'School': return <School {...iconProps} />;
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'BedDouble': return <BedDouble {...iconProps} />;
    case 'Smile': return <Smile {...iconProps} />;
    case 'Bath': return <Bath {...iconProps} />;
    case 'UtensilsCrossed': return <UtensilsCrossed {...iconProps} />;
    case 'Moon': return <Moon {...iconProps} />;
    case 'GlassWater': return <GlassWater {...iconProps} />;
    case 'Apple': return <Apple {...iconProps} />;
    case 'DoorClosed': return <DoorClosed {...iconProps} />;
    case 'Bed': return <Bed {...iconProps} />;
    case 'Gamepad2': return <Gamepad2 {...iconProps} />;
    case 'Palette': return <Palette {...iconProps} />;
    case 'Music': return <Music {...iconProps} />;
    case 'MapPin': return <MapPin {...iconProps} />;
    case 'RefreshCw': return <RefreshCw {...iconProps} />;
    case 'Frown': return <Frown {...iconProps} />;
    case 'AlertCircle': return <AlertCircle {...iconProps} />;
    case 'ShieldAlert': return <ShieldAlert {...iconProps} />;
    case 'BatteryLow': return <BatteryLow {...iconProps} />;
    case 'Hourglass': return <Hourglass {...iconProps} />;
    case 'CheckCircle2': return <CheckCircle2 {...iconProps} />;
    case 'XCircle': return <XCircle {...iconProps} />;
    case 'PlusCircle': return <PlusCircle {...iconProps} />;
    case 'CheckSquare': return <CheckSquare {...iconProps} />;
    case 'HeartHandshake': return <HeartHandshake {...iconProps} />;
    case 'Ban': return <Ban {...iconProps} />;
    case 'Calendar': return <Calendar {...iconProps} />;
    case 'Clock': return <Clock {...iconProps} />;
    case 'MessageSquare': return <MessageSquare {...iconProps} />;
    case 'Heart': return <Heart {...iconProps} />;
    case 'User': return <User {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'HelpCircle': return <HelpCircle {...iconProps} />;
    case 'Sliders': return <Sliders {...iconProps} />;
    case 'ChevronRight': return <ChevronRight {...iconProps} />;
    case 'Plus': return <Plus {...iconProps} />;
    case 'Trash2': return <Trash2 {...iconProps} />;
    case 'Edit2': return <Edit2 {...iconProps} />;
    case 'Share2': return <Share2 {...iconProps} />;
    case 'Volume2': return <Volume2 {...iconProps} />;
    case 'VolumeX': return <VolumeX {...iconProps} />;
    case 'Eye': return <Eye {...iconProps} />;
    case 'ArrowUpDown': return <ArrowUpDown {...iconProps} />;
    case 'Download': return <Download {...iconProps} />;
    case 'Check': return <Check {...iconProps} />;
    case 'X': return <X {...iconProps} />;
    case 'FileText': return <FileText {...iconProps} />;
    case 'Wind': return <Wind {...iconProps} />;
    case 'Info': return <Info {...iconProps} />;
    case 'Sparkle': return <Sparkle {...iconProps} />;
    case 'Search': return <Search {...iconProps} />;
    case 'Star': return <Star {...iconProps} />;
    case 'Maximize2': return <Maximize2 {...iconProps} />;
    case 'Send': return <Send {...iconProps} />;
    case 'Loader2': return <Loader2 {...iconProps} />;
    case 'ChevronDown': return <ChevronDown {...iconProps} />;
    case 'ChevronUp': return <ChevronUp {...iconProps} />;
    default: return <Smile {...iconProps} />;
  }
};
