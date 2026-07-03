import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const testConvApi = async () => {
  try {
    // Log in as Tenant
    console.log("Logging in as Tenant...");
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: "siddharth.tenant@test.com",
      password: "Password123"
    });
    const token = loginRes.data.data.token;
    const userId = loginRes.data.data.user.id;
    console.log(`Logged in! User ID: ${userId}`);

    // Get conversations
    console.log("Calling /chat/conversations...");
    const convRes = await axios.get(`${BASE_URL}/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Conversations response:", JSON.stringify(convRes.data, null, 2));

  } catch (error) {
    console.error("API call failed:", error.response?.data || error.message);
  }
};

testConvApi();
