const fs = require('fs');
const path = require('path');

// 직업 카테고리 데이터 구조
// parent_category가 null이면 1차 카테고리, 값이 있으면 2차 카테고리
const categories = [
  // 1. IT/Software Development (1-99)
  { id: 1, name: 'IT & Software', parent: null, icon: '💻' },
  { id: 10, name: 'Web Development', parent: 'IT & Software', icon: '🌐' },
  { id: 11, name: 'Mobile Development', parent: 'IT & Software', icon: '📱' },
  { id: 12, name: 'Backend Development', parent: 'IT & Software', icon: '⚙️' },
  { id: 13, name: 'Frontend Development', parent: 'IT & Software', icon: '🎨' },
  { id: 14, name: 'Full Stack Development', parent: 'IT & Software', icon: '🔧' },
  { id: 15, name: 'DevOps & Cloud', parent: 'IT & Software', icon: '☁️' },
  { id: 16, name: 'Data Science & Analytics', parent: 'IT & Software', icon: '📊' },
  { id: 17, name: 'AI & Machine Learning', parent: 'IT & Software', icon: '🤖' },
  { id: 18, name: 'QA & Testing', parent: 'IT & Software', icon: '🧪' },
  { id: 19, name: 'IT Support & Helpdesk', parent: 'IT & Software', icon: '🛠️' },
  { id: 20, name: 'Network & Security', parent: 'IT & Software', icon: '🔒' },
  { id: 21, name: 'Database Administration', parent: 'IT & Software', icon: '🗄️' },
  { id: 22, name: 'UI/UX Design', parent: 'IT & Software', icon: '✨' },

  // 2. Marketing & Sales (100-199)
  { id: 100, name: 'Marketing & Sales', parent: null, icon: '📈' },
  { id: 110, name: 'Digital Marketing', parent: 'Marketing & Sales', icon: '💡' },
  { id: 111, name: 'Social Media Marketing', parent: 'Marketing & Sales', icon: '📱' },
  { id: 112, name: 'Content Marketing', parent: 'Marketing & Sales', icon: '✍️' },
  { id: 113, name: 'SEO/SEM', parent: 'Marketing & Sales', icon: '🔍' },
  { id: 114, name: 'Email Marketing', parent: 'Marketing & Sales', icon: '📧' },
  { id: 115, name: 'Brand Management', parent: 'Marketing & Sales', icon: '🏷️' },
  { id: 116, name: 'Product Marketing', parent: 'Marketing & Sales', icon: '📦' },
  { id: 117, name: 'Sales Executive', parent: 'Marketing & Sales', icon: '💼' },
  { id: 118, name: 'Business Development', parent: 'Marketing & Sales', icon: '🚀' },
  { id: 119, name: 'Account Management', parent: 'Marketing & Sales', icon: '🤝' },
  { id: 120, name: 'Retail Sales', parent: 'Marketing & Sales', icon: '🏪' },

  // 3. Design & Creative (200-299)
  { id: 200, name: 'Design & Creative', parent: null, icon: '🎨' },
  { id: 210, name: 'Graphic Design', parent: 'Design & Creative', icon: '🖌️' },
  { id: 211, name: 'Product Design', parent: 'Design & Creative', icon: '📐' },
  { id: 212, name: 'Interior Design', parent: 'Design & Creative', icon: '🏠' },
  { id: 213, name: 'Fashion Design', parent: 'Design & Creative', icon: '👗' },
  { id: 214, name: 'Video Editing', parent: 'Design & Creative', icon: '🎬' },
  { id: 215, name: 'Photography', parent: 'Design & Creative', icon: '📷' },
  { id: 216, name: 'Animation & 3D', parent: 'Design & Creative', icon: '🎞️' },
  { id: 217, name: 'Illustration', parent: 'Design & Creative', icon: '🎭' },

  // 4. Customer Service (300-399)
  { id: 300, name: 'Customer Service', parent: null, icon: '🎧' },
  { id: 310, name: 'Call Center', parent: 'Customer Service', icon: '📞' },
  { id: 311, name: 'Customer Support', parent: 'Customer Service', icon: '💬' },
  { id: 312, name: 'Technical Support', parent: 'Customer Service', icon: '🔧' },
  { id: 313, name: 'Customer Success', parent: 'Customer Service', icon: '⭐' },
  { id: 314, name: 'Front Office', parent: 'Customer Service', icon: '🏢' },
  { id: 315, name: 'Receptionist', parent: 'Customer Service', icon: '📋' },

  // 5. Finance & Accounting (400-499)
  { id: 400, name: 'Finance & Accounting', parent: null, icon: '💰' },
  { id: 410, name: 'Accounting', parent: 'Finance & Accounting', icon: '📊' },
  { id: 411, name: 'Tax Accounting', parent: 'Finance & Accounting', icon: '🧾' },
  { id: 412, name: 'Auditing', parent: 'Finance & Accounting', icon: '🔍' },
  { id: 413, name: 'Financial Analysis', parent: 'Finance & Accounting', icon: '📈' },
  { id: 414, name: 'Investment Banking', parent: 'Finance & Accounting', icon: '🏦' },
  { id: 415, name: 'Treasury', parent: 'Finance & Accounting', icon: '💵' },
  { id: 416, name: 'Billing & Collections', parent: 'Finance & Accounting', icon: '💳' },

  // 6. Human Resources (500-599)
  { id: 500, name: 'Human Resources', parent: null, icon: '👥' },
  { id: 510, name: 'Recruitment', parent: 'Human Resources', icon: '🔎' },
  { id: 511, name: 'HR Generalist', parent: 'Human Resources', icon: '📝' },
  { id: 512, name: 'Training & Development', parent: 'Human Resources', icon: '📚' },
  { id: 513, name: 'Compensation & Benefits', parent: 'Human Resources', icon: '💼' },
  { id: 514, name: 'Employee Relations', parent: 'Human Resources', icon: '🤝' },
  { id: 515, name: 'HR Analytics', parent: 'Human Resources', icon: '📊' },

  // 7. Education & Training (600-699)
  { id: 600, name: 'Education & Training', parent: null, icon: '📚' },
  { id: 610, name: 'Teacher', parent: 'Education & Training', icon: '👨‍🏫' },
  { id: 611, name: 'Tutor', parent: 'Education & Training', icon: '📖' },
  { id: 612, name: 'Instructor', parent: 'Education & Training', icon: '🎓' },
  { id: 613, name: 'Corporate Trainer', parent: 'Education & Training', icon: '💼' },
  { id: 614, name: 'Curriculum Developer', parent: 'Education & Training', icon: '📋' },
  { id: 615, name: 'Educational Consultant', parent: 'Education & Training', icon: '🎯' },

  // 8. Healthcare & Medical (700-799)
  { id: 700, name: 'Healthcare & Medical', parent: null, icon: '⚕️' },
  { id: 710, name: 'Doctor', parent: 'Healthcare & Medical', icon: '👨‍⚕️' },
  { id: 711, name: 'Nurse', parent: 'Healthcare & Medical', icon: '👩‍⚕️' },
  { id: 712, name: 'Pharmacist', parent: 'Healthcare & Medical', icon: '💊' },
  { id: 713, name: 'Medical Technician', parent: 'Healthcare & Medical', icon: '🔬' },
  { id: 714, name: 'Dentist', parent: 'Healthcare & Medical', icon: '🦷' },
  { id: 715, name: 'Physical Therapist', parent: 'Healthcare & Medical', icon: '🏃' },
  { id: 716, name: 'Nutritionist', parent: 'Healthcare & Medical', icon: '🥗' },
  { id: 717, name: 'Medical Representative', parent: 'Healthcare & Medical', icon: '💼' },

  // 9. Engineering (800-899)
  { id: 800, name: 'Engineering', parent: null, icon: '⚙️' },
  { id: 810, name: 'Civil Engineering', parent: 'Engineering', icon: '🏗️' },
  { id: 811, name: 'Mechanical Engineering', parent: 'Engineering', icon: '🔧' },
  { id: 812, name: 'Electrical Engineering', parent: 'Engineering', icon: '⚡' },
  { id: 813, name: 'Chemical Engineering', parent: 'Engineering', icon: '🧪' },
  { id: 814, name: 'Industrial Engineering', parent: 'Engineering', icon: '🏭' },
  { id: 815, name: 'Environmental Engineering', parent: 'Engineering', icon: '🌱' },
  { id: 816, name: 'Quality Engineering', parent: 'Engineering', icon: '✅' },

  // 10. Manufacturing & Production (900-999)
  { id: 900, name: 'Manufacturing & Production', parent: null, icon: '🏭' },
  { id: 910, name: 'Production Manager', parent: 'Manufacturing & Production', icon: '👨‍💼' },
  { id: 911, name: 'Production Operator', parent: 'Manufacturing & Production', icon: '👷' },
  { id: 912, name: 'Quality Control', parent: 'Manufacturing & Production', icon: '🔍' },
  { id: 913, name: 'Assembly Line Worker', parent: 'Manufacturing & Production', icon: '🔧' },
  { id: 914, name: 'Machine Operator', parent: 'Manufacturing & Production', icon: '⚙️' },
  { id: 915, name: 'Warehouse Manager', parent: 'Manufacturing & Production', icon: '📦' },

  // 11. Logistics & Supply Chain (1000-1099)
  { id: 1000, name: 'Logistics & Supply Chain', parent: null, icon: '🚚' },
  { id: 1010, name: 'Supply Chain Manager', parent: 'Logistics & Supply Chain', icon: '📊' },
  { id: 1011, name: 'Procurement', parent: 'Logistics & Supply Chain', icon: '🛒' },
  { id: 1012, name: 'Inventory Management', parent: 'Logistics & Supply Chain', icon: '📋' },
  { id: 1013, name: 'Shipping & Receiving', parent: 'Logistics & Supply Chain', icon: '📦' },
  { id: 1014, name: 'Courier & Delivery', parent: 'Logistics & Supply Chain', icon: '🚗' },
  { id: 1015, name: 'Import/Export', parent: 'Logistics & Supply Chain', icon: '🌏' },

  // 12. Hospitality & Food Service (1100-1199)
  { id: 1100, name: 'Hospitality & Food Service', parent: null, icon: '🍽️' },
  { id: 1110, name: 'Chef', parent: 'Hospitality & Food Service', icon: '👨‍🍳' },
  { id: 1111, name: 'Cook', parent: 'Hospitality & Food Service', icon: '🍳' },
  { id: 1112, name: 'Waiter/Waitress', parent: 'Hospitality & Food Service', icon: '🍷' },
  { id: 1113, name: 'Bartender', parent: 'Hospitality & Food Service', icon: '🍹' },
  { id: 1114, name: 'Hotel Management', parent: 'Hospitality & Food Service', icon: '🏨' },
  { id: 1115, name: 'Housekeeping', parent: 'Hospitality & Food Service', icon: '🧹' },
  { id: 1116, name: 'Food & Beverage Manager', parent: 'Hospitality & Food Service', icon: '🍴' },
  { id: 1117, name: 'Catering', parent: 'Hospitality & Food Service', icon: '🎂' },

  // 13. Construction & Architecture (1200-1299)
  { id: 1200, name: 'Construction & Architecture', parent: null, icon: '🏗️' },
  { id: 1210, name: 'Architect', parent: 'Construction & Architecture', icon: '📐' },
  { id: 1211, name: 'Construction Manager', parent: 'Construction & Architecture', icon: '👷‍♂️' },
  { id: 1212, name: 'Site Engineer', parent: 'Construction & Architecture', icon: '🏗️' },
  { id: 1213, name: 'Surveyor', parent: 'Construction & Architecture', icon: '📏' },
  { id: 1214, name: 'Carpenter', parent: 'Construction & Architecture', icon: '🔨' },
  { id: 1215, name: 'Electrician', parent: 'Construction & Architecture', icon: '💡' },
  { id: 1216, name: 'Plumber', parent: 'Construction & Architecture', icon: '🚰' },
  { id: 1217, name: 'Welder', parent: 'Construction & Architecture', icon: '🔥' },
  { id: 1218, name: 'Bricklayer/Mason', parent: 'Construction & Architecture', icon: '🧱' },
  { id: 1219, name: 'Plasterer', parent: 'Construction & Architecture', icon: '🪛' },
  { id: 1220, name: 'Tile Setter', parent: 'Construction & Architecture', icon: '🔲' },
  { id: 1221, name: 'Painter', parent: 'Construction & Architecture', icon: '🎨' },
  { id: 1222, name: 'Rebar Worker', parent: 'Construction & Architecture', icon: '⚒️' },
  { id: 1223, name: 'Scaffolder', parent: 'Construction & Architecture', icon: '🪜' },
  { id: 1224, name: 'Waterproofing Specialist', parent: 'Construction & Architecture', icon: '💧' },
  { id: 1225, name: 'Glazier', parent: 'Construction & Architecture', icon: '🪟' },
  { id: 1226, name: 'Roofer', parent: 'Construction & Architecture', icon: '🏠' },
  { id: 1227, name: 'Crane Operator', parent: 'Construction & Architecture', icon: '🏗️' },
  { id: 1228, name: 'Heavy Equipment Operator', parent: 'Construction & Architecture', icon: '🚜' },

  // 14. Legal & Compliance (1300-1399)
  { id: 1300, name: 'Legal & Compliance', parent: null, icon: '⚖️' },
  { id: 1310, name: 'Lawyer', parent: 'Legal & Compliance', icon: '👨‍⚖️' },
  { id: 1311, name: 'Legal Advisor', parent: 'Legal & Compliance', icon: '📜' },
  { id: 1312, name: 'Paralegal', parent: 'Legal & Compliance', icon: '📋' },
  { id: 1313, name: 'Compliance Officer', parent: 'Legal & Compliance', icon: '✅' },
  { id: 1314, name: 'Contract Manager', parent: 'Legal & Compliance', icon: '📄' },

  // 15. Media & Communications (1400-1499)
  { id: 1400, name: 'Media & Communications', parent: null, icon: '📺' },
  { id: 1410, name: 'Journalist', parent: 'Media & Communications', icon: '📰' },
  { id: 1411, name: 'Content Writer', parent: 'Media & Communications', icon: '✍️' },
  { id: 1412, name: 'Copywriter', parent: 'Media & Communications', icon: '📝' },
  { id: 1413, name: 'Public Relations', parent: 'Media & Communications', icon: '📢' },
  { id: 1414, name: 'Communications Manager', parent: 'Media & Communications', icon: '📡' },
  { id: 1415, name: 'Broadcaster', parent: 'Media & Communications', icon: '🎙️' },
  { id: 1416, name: 'Editor', parent: 'Media & Communications', icon: '✏️' },

  // 16. Administrative & Office Support (1500-1599)
  { id: 1500, name: 'Administrative & Office Support', parent: null, icon: '📁' },
  { id: 1510, name: 'Administrative Assistant', parent: 'Administrative & Office Support', icon: '📋' },
  { id: 1511, name: 'Office Manager', parent: 'Administrative & Office Support', icon: '🏢' },
  { id: 1512, name: 'Secretary', parent: 'Administrative & Office Support', icon: '💼' },
  { id: 1513, name: 'Data Entry', parent: 'Administrative & Office Support', icon: '⌨️' },
  { id: 1514, name: 'Document Controller', parent: 'Administrative & Office Support', icon: '📄' },
  { id: 1515, name: 'Personal Assistant', parent: 'Administrative & Office Support', icon: '👔' },

  // 17. Agriculture & Farming (1600-1699)
  { id: 1600, name: 'Agriculture & Farming', parent: null, icon: '🌾' },
  { id: 1610, name: 'Farm Manager', parent: 'Agriculture & Farming', icon: '🚜' },
  { id: 1611, name: 'Agricultural Engineer', parent: 'Agriculture & Farming', icon: '🌱' },
  { id: 1612, name: 'Plantation Worker', parent: 'Agriculture & Farming', icon: '🌴' },
  { id: 1613, name: 'Livestock Manager', parent: 'Agriculture & Farming', icon: '🐄' },
  { id: 1614, name: 'Fishery', parent: 'Agriculture & Farming', icon: '🐟' },

  // 18. Others (1700-1799)
  { id: 1700, name: 'Others', parent: null, icon: '📌' },
  { id: 1710, name: 'Driver', parent: 'Others', icon: '🚗' },
  { id: 1711, name: 'Security Guard', parent: 'Others', icon: '🛡️' },
  { id: 1712, name: 'Cleaning Service', parent: 'Others', icon: '🧹' },
  { id: 1713, name: 'General Labor', parent: 'Others', icon: '💪' },
  { id: 1714, name: 'Part-time Jobs', parent: 'Others', icon: '⏰' },
  { id: 1715, name: 'Freelance', parent: 'Others', icon: '💼' },
];

// SQL 생성
function generateSQL() {
  let sql = '-- Insert job categories data\n';
  sql += '-- 1st level categories (parent_category is NULL)\n';
  sql += '-- 2nd level categories (parent_category contains parent name)\n\n';
  sql += 'INSERT INTO "public"."categories" ("category_id", "name", "parent_category", "icon") VALUES\n';

  const values = categories.map((cat, index) => {
    const parent = cat.parent ? `'${cat.parent}'` : 'NULL';
    const line = `(${cat.id}, '${cat.name}', ${parent}, '${cat.icon}')`;
    return index === categories.length - 1 ? line : line + ',';
  });

  sql += values.join('\n');
  sql += '\nON CONFLICT (category_id) DO NOTHING;\n';

  return sql;
}

// 통계 정보 생성
function generateStats() {
  const parentCategories = categories.filter(c => !c.parent);
  const childCategories = categories.filter(c => c.parent);

  console.log('\n=== 직업 카테고리 통계 ===\n');
  console.log(`총 카테고리 수: ${categories.length}`);
  console.log(`1차 카테고리: ${parentCategories.length}`);
  console.log(`2차 카테고리: ${childCategories.length}\n`);

  console.log('=== 1차 카테고리 목록 ===\n');
  parentCategories.forEach(cat => {
    const children = categories.filter(c => c.parent === cat.name);
    console.log(`${cat.icon} ${cat.name} (ID: ${cat.id}) - ${children.length}개의 하위 카테고리`);
  });
}

// 파일 저장
const outputFile = path.join(__dirname, '..', 'supabase', 'migrations', '20251020000003_insert_categories_data.sql');
const sql = generateSQL();

fs.writeFileSync(outputFile, sql, 'utf8');

console.log(`✓ SQL 파일 생성 완료: ${outputFile}`);
generateStats();
