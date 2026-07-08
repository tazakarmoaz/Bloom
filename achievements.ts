export interface AchievementDef {
  key: string;
  label: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // البداية
  { key: 'first_entry',       label: 'البداية',              description: 'أكمل أول تسجيل يومي.',                      icon: 'Sprout' },
  // سلاسل
  { key: 'streak_3',          label: '3 أيام متتالية',        description: 'سجل لمدة 3 أيام متتالية.',                  icon: 'Flame' },
  { key: 'streak_7',          label: 'أسبوع متتالي',          description: 'سجل لمدة 7 أيام متتالية.',                  icon: 'Flame' },
  { key: 'streak_14',         label: 'أسبوعان متتاليان',      description: 'سجل لمدة 14 يومًا متتاليًا.',               icon: 'Flame' },
  { key: 'streak_30',         label: 'شهر متتالي',            description: 'سجل لمدة 30 يومًا متتاليًا.',               icon: 'Flame' },
  { key: 'streak_50',         label: '50 يومًا متتاليًا',     description: 'سجل لمدة 50 يومًا متتاليًا.',               icon: 'Flame' },
  { key: 'streak_100',        label: '100 يوم متتالي',         description: 'سجل لمدة 100 يوم متتالي.',                  icon: 'Flame' },
  // إجمالي وردات
  { key: 'total_5',           label: 'بستان صغير',            description: 'ازرع 5 وردات في حديقتك.',                   icon: 'Flower2' },
  { key: 'total_10',          label: '10 وردات',               description: 'ازرع 10 وردات في حديقتك.',                  icon: 'Flower2' },
  { key: 'total_25',          label: '25 وردة',                description: 'ازرع 25 وردة في حديقتك.',                   icon: 'Flower2' },
  { key: 'total_50',          label: '50 وردة',                description: 'ازرع 50 وردة في حديقتك.',                   icon: 'Flower2' },
  { key: 'total_100',         label: '100 وردة',               description: 'ازرع 100 وردة في حديقتك.',                  icon: 'Flower2' },
  { key: 'total_200',         label: '200 وردة',               description: 'ازرع 200 وردة في حديقتك.',                  icon: 'Flower2' },
  { key: 'total_365',         label: 'عام من الورد',           description: 'ازرع 365 وردة في حديقتك.',                  icon: 'Flower2' },
  // تنوع المزاجات
  { key: 'moods_5',           label: 'تنوّع المشاعر',          description: 'استخدم 5 مزاجات مختلفة.',                   icon: 'Palette' },
  { key: 'all_moods',         label: 'كل المزاجات',            description: 'جرب 15 مزاجًا مختلفًا.',                    icon: 'Palette' },
  // الحدائق
  { key: 'second_garden',     label: 'حديقة جديدة',            description: 'افتح حديقة ثانية.',                         icon: 'Map' },
  { key: 'five_gardens',      label: 'خمس حدائق',              description: 'افتح خمس حدائق.',                           icon: 'Map' },
  { key: 'garden_full',       label: 'حديقة ممتلئة',           description: 'املأ حديقة واحدة بالكامل (50 وردة).',       icon: 'Award' },
  // المفضلة
  { key: 'first_favorite',    label: 'تفضيل',                  description: 'أضف إدخالًا إلى المفضلة.',                  icon: 'Heart' },
  { key: 'favorite_10',       label: '10 مفضلات',              description: 'أضف 10 إدخالات إلى المفضلة.',               icon: 'Heart' },
  { key: 'favorite_25',       label: '25 مفضلة',               description: 'أضف 25 إدخالًا إلى المفضلة.',               icon: 'Heart' },
  // الصور
  { key: 'first_photo',       label: 'لحظة مصورة',             description: 'أرفق صورة بإحدى التسجيلات.',                icon: 'Camera' },
  { key: 'photo_10',          label: '10 لحظات',               description: 'أرفق 10 صور بتسجيلاتك.',                    icon: 'Camera' },
  { key: 'photo_25',          label: '25 لحظة',                description: 'أرفق 25 صورة بتسجيلاتك.',                   icon: 'Camera' },
  // الملاحظات
  { key: 'first_note',        label: 'ملاحظة أولى',            description: 'أضف ملاحظة إلى تسجيلك.',                    icon: 'FileText' },
  { key: 'notes_20',          label: '20 ملاحظة',              description: 'أضف 20 ملاحظة إلى تسجيلاتك.',               icon: 'FileText' },
  { key: 'notes_50',          label: '50 ملاحظة',              description: 'أضف 50 ملاحظة إلى تسجيلاتك.',               icon: 'FileText' },
  { key: 'long_note',         label: 'قلم رشيق',               description: 'اكتب ملاحظة تتجاوز 200 حرف.',               icon: 'PenLine' },
  // مخصص
  { key: 'first_custom_prompt', label: 'سؤال خاص',             description: 'أضف سؤالًا مخصصًا.',                        icon: 'MessageSquare' },
  { key: 'prompts_5',         label: '5 أسئلة خاصة',           description: 'أضف 5 أسئلة مخصصة.',                        icon: 'MessageSquare' },
  { key: 'first_custom_mood', label: 'مزاج خاص',               description: 'أضف مزاجًا مخصصًا.',                        icon: 'Smile' },
  { key: 'moods_3_custom',    label: '3 مزاجات خاصة',          description: 'أضف 3 مزاجات مخصصة.',                       icon: 'Smile' },
  // إضافية
  { key: 'weekend_warrior',   label: 'محارب العطلة',           description: 'سجل في عطلة نهاية الأسبوع 4 مرات.',         icon: 'Sun' },
  { key: 'early_bird',        label: 'الطائر المبكر',          description: 'سجل في أول أسبوع 5 أيام.',                  icon: 'Sunrise' },
];

export function checkAchievements(params: {
  total: number;
  streak: number;
  uniqueMoods: Set<string>;
  gardenCount: number;
  favoriteCount: number;
  photoCount: number;
  customPromptCount: number;
  customMoodCount: number;
  noteCount: number;
  longNoteCount: number;
  hasFullGarden: boolean;
  weekendEntryCount: number;
  firstWeekCount: number;
}): string[] {
  const u: string[] = [];
  if (params.total >= 1) u.push('first_entry');
  if (params.streak >= 3) u.push('streak_3');
  if (params.streak >= 7) u.push('streak_7');
  if (params.streak >= 14) u.push('streak_14');
  if (params.streak >= 30) u.push('streak_30');
  if (params.streak >= 50) u.push('streak_50');
  if (params.streak >= 100) u.push('streak_100');
  if (params.total >= 5) u.push('total_5');
  if (params.total >= 10) u.push('total_10');
  if (params.total >= 25) u.push('total_25');
  if (params.total >= 50) u.push('total_50');
  if (params.total >= 100) u.push('total_100');
  if (params.total >= 200) u.push('total_200');
  if (params.total >= 365) u.push('total_365');
  if (params.uniqueMoods.size >= 5) u.push('moods_5');
  if (params.uniqueMoods.size >= 15) u.push('all_moods');
  if (params.gardenCount >= 2) u.push('second_garden');
  if (params.gardenCount >= 5) u.push('five_gardens');
  if (params.hasFullGarden) u.push('garden_full');
  if (params.favoriteCount >= 1) u.push('first_favorite');
  if (params.favoriteCount >= 10) u.push('favorite_10');
  if (params.favoriteCount >= 25) u.push('favorite_25');
  if (params.photoCount >= 1) u.push('first_photo');
  if (params.photoCount >= 10) u.push('photo_10');
  if (params.photoCount >= 25) u.push('photo_25');
  if (params.noteCount >= 1) u.push('first_note');
  if (params.noteCount >= 20) u.push('notes_20');
  if (params.noteCount >= 50) u.push('notes_50');
  if (params.longNoteCount >= 1) u.push('long_note');
  if (params.customPromptCount >= 1) u.push('first_custom_prompt');
  if (params.customPromptCount >= 5) u.push('prompts_5');
  if (params.customMoodCount >= 1) u.push('first_custom_mood');
  if (params.customMoodCount >= 3) u.push('moods_3_custom');
  if (params.weekendEntryCount >= 4) u.push('weekend_warrior');
  if (params.firstWeekCount >= 5) u.push('early_bird');
  return u;
}
