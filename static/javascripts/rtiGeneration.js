// Function to get Gemini API key from environment
async function getGeminiKey() {
    try {
        console.log('Fetching Gemini API key from server...');
        const response = await fetch('/get-gemini-key');
        console.log('Server response status:', response.status);
        
        const data = await response.json();
        console.log('Server response received');
        
        if (response.status !== 200) {
            console.error('Server error:', data.error);
            throw new Error(data.error || 'Failed to get Gemini API key');
        }
        
        if (!data.key) {
            console.error('No API key in response');
            throw new Error('No API key returned from server');
        }
        
        console.log('API key retrieved successfully');
        return data.key;
    } catch (error) {
        console.error('Error fetching Gemini API key:', error);
        throw new Error('Failed to get Gemini API key. Please check your configuration.');
    }
}

let lastPredictedDepartment = null;

// Function to predict department using Gemini API
async function predictDepartment(query) {
    try {
        const apiKey = await getGeminiKey();
        if (!apiKey) {
            throw new Error('Failed to get Gemini API key');
        }

        console.log('Making request to Gemini API...');
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        console.log('API URL (without key):', apiUrl.split('?')[0]);
        
        const requestBody = {
            contents: [{
                role: "user",
                parts: [{
                    text: `Given this RTI query: "${query}"

Please analyze it and determine the most appropriate Indian government ministry or department to handle this query. Consider the following:

1. The query's subject matter and scope
2. The specific responsibilities of different Indian ministries
3. The jurisdictional authority over the matter
4. The level of government involved (central, state, or local)

For a query about gold rates and financial matters, consider:
- Ministry of Finance
- Reserve Bank of India
- Ministry of Commerce and Industry

Return a JSON object with the following structure:
{
    "name": "Full official name of the ministry/department",
    "description": "Brief description of why this department is the most appropriate for handling this query"
}

For example:
- Education queries -> Ministry of Education
- Environmental concerns -> Ministry of Environment, Forest and Climate Change
- Women's welfare -> Ministry of Women and Child Development
- Local governance -> Ministry of Panchayati Raj
- Financial matters -> Ministry of Finance or Reserve Bank of India
- Trade and commerce -> Ministry of Commerce and Industry

Return ONLY the JSON object, no other text.`
                }]
            }],
            generationConfig: {
                temperature: 0.1,
                topK: 1,
                topP: 1,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE"
                }
            ]
        };

        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries([...response.headers]));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response structure:', JSON.stringify(data, null, 2));

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid API response structure:', JSON.stringify(data, null, 2));
            throw new Error('Invalid response from Gemini API');
        }
        
        try {
            const responseText = data.candidates[0].content.parts[0].text;
            console.log('Raw response text:', responseText);
            
            // Clean up the response text by removing markdown code blocks if present
            let jsonText = responseText;
            if (responseText.includes('```')) {
                jsonText = responseText
                    .replace(/```json\n/g, '') // Remove ```json
                    .replace(/```\n/g, '')     // Remove ```\n
                    .replace(/```/g, '')       // Remove any remaining ```
                    .trim();                   // Remove any extra whitespace
            }
            
            console.log('Cleaned JSON text:', jsonText);
            const departmentInfo = JSON.parse(jsonText);
            console.log('Parsed department info:', departmentInfo);
            
            if (!departmentInfo.name || !departmentInfo.description) {
                console.error('Invalid department info format:', departmentInfo);
                throw new Error('Invalid department info format');
            }
            
            // Store the department info
            lastPredictedDepartment = departmentInfo;
            
            return departmentInfo;
        } catch (parseError) {
            console.error('Error parsing department info:', parseError);
            console.error('Response text that failed to parse:', data.candidates[0]?.content?.parts?.[0]?.text);
            throw new Error('Failed to parse department information');
        }
    } catch (error) {
        console.error('Detailed error in predictDepartment:', error);
        if (error.message.includes('API key')) {
            throw new Error('API key configuration error. Please check your settings.');
        } else if (error.message.includes('parse')) {
            throw new Error('Error processing AI response. Please try again.');
        } else {
            throw new Error('Failed to predict appropriate department. Please try again. Error: ' + error.message);
        }
    }
}

// Function to get the last predicted department
function getLastPredictedDepartment() {
    return lastPredictedDepartment;
}

// Function to enhance RTI query using Gemini API
async function enhanceRTIQuery(query) {
    try {
        const apiKey = await getGeminiKey();
        if (!apiKey) {
            throw new Error('Failed to get Gemini API key');
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{
                        text: `Please enhance and formalize the following RTI query while maintaining its core intent. Make it more specific, clear, and actionable. The enhanced query should:

1. Be precise about what information is being requested
2. Use appropriate formal language
3. Be specific about the timeframe or scope if relevant
4. Maintain the original purpose of the query

Original query: "${query}"

Return only the enhanced query text, no other text or explanations.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE"
                    }
                ]
            })
        });

        const data = await response.json();
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response from Gemini API');
        }
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error('Error enhancing RTI query:', error);
        return query; // Return original query if enhancement fails
    }
}

// Function to generate RTI letter with enhanced query and predicted department
async function generateEnhancedRTILetter(query, name, address) {
    try {
        // First enhance the query
        const enhancedQuery = await enhanceRTIQuery(query);
        
        // Then predict the appropriate department
        const department = await predictDepartment(query);
        
        // Generate the RTI letter using the enhanced query and predicted department
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

${enhancedQuery}

I hereby state that the information sought does not fall within the restrictions contained in Section 8 and 9 of the RTI Act and to the best of my knowledge, it pertains to your department.

I am hereby paying the application fee of Rs. 10/- (Rupees Ten Only).

I request that the information be provided to me at the earliest, as per the provisions of the Act.

Thanking you.

Yours faithfully,
${name}`;
    } catch (error) {
        throw error; // Propagate the error to be handled by the form submission handler
    }
}

// Export the functions
window.rtiGeneration = {
    generateEnhancedRTILetter,
    getLastPredictedDepartment
}; 