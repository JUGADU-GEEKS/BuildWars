const departments = [
    {
      id: "environment",
      name: "Ministry of Environment, Forest and Climate Change",
      category: "Environment",
      description: "Handles environmental protection, forest conservation, and climate change matters.",
    },
    {
      id: "education",
      name: "Ministry of Education",
      category: "Education",
      description: "Handles matters related to education policies, institutions, and standards.",
    },
    {
      id: "health",
      name: "Ministry of Health and Family Welfare",
      category: "Healthcare",
      description: "Responsible for health policy, regulation of medical education, and public health.",
    },
    {
      id: "transport",
      name: "Ministry of Road Transport and Highways",
      category: "Transportation",
      description: "Deals with development and maintenance of highways and road transport.",
    },
    {
      id: "water",
      name: "Ministry of Jal Shakti",
      category: "Water Resources",
      description: "Handles water resources management and drinking water supply.",
    },
    {
      id: "urban",
      name: "Ministry of Housing and Urban Affairs",
      category: "Urban Development",
      description: "In charge of housing and urban development policies and programs.",
    },
    {
      id: "rural",
      name: "Ministry of Rural Development",
      category: "Rural Development",
      description: "Works on rural development schemes and poverty alleviation programs.",
    },
  ];
  
  // RTI Examples
  const rtiExamples = [
    {
      id: "env1",
      title: "Tree Cutting Concerns",
      category: "Environment",
      content: "I would like to know the number of trees cut in my area in the last 6 months and whether proper permissions were obtained for the same.",
      department: "Ministry of Environment, Forest and Climate Change",
    },
    {
      id: "edu1",
      title: "School Infrastructure Funding",
      category: "Education",
      content: "I would like to know the budget allocated for school infrastructure development in my district for the financial year 2022-23, along with details of how these funds were utilized.",
      department: "Ministry of Education",
    },
    {
      id: "health1",
      title: "Hospital Staff Vacancies",
      category: "Healthcare",
      content: "Please provide information regarding the current number of vacancies for doctors and nurses in government hospitals in my city, along with the timeline for filling these positions.",
      department: "Ministry of Health and Family Welfare",
    },
    {
      id: "transport1",
      title: "Road Construction Project Status",
      category: "Transportation",
      content: "I request details about the status of the highway construction project between [Location A] and [Location B], including the expected completion date and current budget utilization.",
      department: "Ministry of Road Transport and Highways",
    },
    {
      id: "water1",
      title: "Water Supply Schedule",
      category: "Water Resources",
      content: "I would like to know the official water supply schedule for [Area/Location], and the measures being taken to address water shortages in this region.",
      department: "Ministry of Jal Shakti",
    },
    {
      id: "urban1",
      title: "Urban Housing Scheme Beneficiaries",
      category: "Urban Development",
      content: "Please provide the list of beneficiaries selected under the [Housing Scheme Name] in [City/Municipality] during the past year, along with the selection criteria applied.",
      department: "Ministry of Housing and Urban Affairs",
    },
    {
      id: "rural1",
      title: "MGNREGA Implementation",
      category: "Rural Development",
      content: "I request information about the implementation of MGNREGA in [Village/Block], including the number of work days created and wages paid during the financial year 2022-23.",
      department: "Ministry of Rural Development",
    },
  ];
  
  // Function to suggest departments based on query content
  function suggestDepartment(query) {
    const keywords = {
      environment: ["tree", "forest", "environment", "pollution", "climate", "wildlife", "green", "ecology", "cutting", "environmental"],
      education: ["school", "education", "student", "teacher", "university", "college", "admission", "curriculum"],
      health: ["hospital", "health", "medical", "doctor", "nurse", "patient", "disease", "vaccine", "medicine"],
      transport: ["road", "transport", "highway", "vehicle", "traffic", "license", "permit", "bus", "train"],
      water: ["water", "river", "dam", "irrigation", "drinking water", "pipeline", "borewell", "watershed"],
      urban: ["housing", "urban", "city", "municipal", "building", "apartment", "construction", "smart city"],
      rural: ["village", "rural", "panchayat", "MGNREGA", "employment", "farm", "agriculture", "poverty"]
    };
  
    const queryLower = query.toLowerCase();
    const matches = {};
  
    // Initialize all departments with zero matches
    Object.keys(keywords).forEach(dept => {
      matches[dept] = 0;
    });
  
    // Count keyword matches
    Object.entries(keywords).forEach(([dept, words]) => {
      words.forEach(word => {
        if (queryLower.includes(word.toLowerCase())) {
          matches[dept] += 1;
        }
      });
    });
  
    // Sort departments by number of matches
    const sortedDepts = Object.keys(matches)
      .filter(dept => matches[dept] > 0)
      .sort((a, b) => matches[b] - matches[a]);
  
    // Return top matching departments
    return sortedDepts.map(id => 
      departments.find(dept => dept.id === id)
    ).filter(Boolean);
  }
  
  // Function to generate RTI letter
  function generateRtiLetter(query, department, name, address) {
    const date = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  
    return `
  Date: ${date}
  
  To,
  The Public Information Officer,
  ${department.name},
  Government of India.
  
  Subject: Application under Right to Information Act, 2005
  
  Sir/Madam,
  
  I, ${name}, resident of ${address}, would like to request the following information under the provisions of the Right to Information Act, 2005:
  
  ${query}
  
  I hereby state that the information sought does not fall within the restrictions contained in Section 8 and 9 of the RTI Act and to the best of my knowledge, it pertains to your department.
  
  I am hereby paying the application fee of Rs. 10/- (Rupees Ten Only).
  
  I request that the information be provided to me at the earliest, as per the provisions of the Act.
  
  Thanking you.
  
  Yours faithfully,
  ${name}
  `;
  }