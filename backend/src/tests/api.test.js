import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const testApi = async () => {
  console.log("🚀 Starting backend integration tests...\n");

  let tenantToken = "";
  let ownerToken = "";
  let tenantId = "";
  let ownerId = "";
  let listingId = "";
  let interestId = "";

  const rand = Math.floor(Math.random() * 1000000);
  const tenantEmail = `tenant_${rand}@test.com`;
  const ownerEmail = `owner_${rand}@test.com`;
  const phoneTenant = `1${String(rand).padStart(9, "0")}`.substring(0, 10);
  const phoneOwner = `2${String(rand).padStart(9, "0")}`.substring(0, 10);

  try {
    // ----------------------------------------------------
    // TEST 1: Register Tenant
    // ----------------------------------------------------
    console.log("➡️ Test 1: Registering Tenant User...");
    const regTenantRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: "John Tenant",
      email: tenantEmail,
      phone: phoneTenant,
      password: "Password123",
      role: "TENANT",
    });
    if (regTenantRes.data.success) {
      tenantToken = regTenantRes.data.data.token;
      tenantId = regTenantRes.data.data.user.id;
      console.log("✅ Tenant registered successfully!");
    } else {
      throw new Error("Tenant registration response not successful");
    }

    // ----------------------------------------------------
    // TEST 2: Register Owner
    // ----------------------------------------------------
    console.log("\n➡️ Test 2: Registering Owner User...");
    const regOwnerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: "Mary Owner",
      email: ownerEmail,
      phone: phoneOwner,
      password: "Password123",
      role: "OWNER",
    });
    if (regOwnerRes.data.success) {
      ownerToken = regOwnerRes.data.data.token;
      ownerId = regOwnerRes.data.data.user.id;
      console.log("✅ Owner registered successfully!");
    } else {
      throw new Error("Owner registration response not successful");
    }

    // ----------------------------------------------------
    // TEST 3: Login User
    // ----------------------------------------------------
    console.log("\n➡️ Test 3: Logging in Tenant...");
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: tenantEmail,
      password: "Password123",
    });
    if (loginRes.data.success && loginRes.data.data.token) {
      console.log("✅ Login successful!");
    } else {
      throw new Error("Login failed");
    }

    // ----------------------------------------------------
    // TEST 4: Create Listing (Owner)
    // ----------------------------------------------------
    console.log("\n➡️ Test 4: Creating Room Listing...");
    const listingRes = await axios.post(
      `${BASE_URL}/listings`,
      {
        title: "Spacious 1BHK in Koramangala",
        location: "Koramangala, Bangalore",
        rent: 15000,
        roomType: "1BHK",
        furnishingStatus: "Semi Furnished",
        availableFrom: new Date(),
        description: "Excellent room with balcony, close to public transport",
      },
      {
        headers: { Authorization: `Bearer ${ownerToken}` },
      }
    );
    if (listingRes.data.success) {
      listingId = listingRes.data.data.id;
      console.log(`✅ Listing created successfully! ID: ${listingId}`);
    } else {
      throw new Error("Create listing failed");
    }

    // ----------------------------------------------------
    // TEST 5: Create Tenant Profile (Tenant)
    // ----------------------------------------------------
    console.log("\n➡️ Test 5: Creating Tenant Preference Profile...");
    const profileRes = await axios.post(
      `${BASE_URL}/tenant/profile`,
      {
        preferredLocation: "Koramangala, Bangalore",
        minBudget: 10000,
        maxBudget: 18000,
        moveInDate: new Date(),
      },
      {
        headers: { Authorization: `Bearer ${tenantToken}` },
      }
    );
    if (profileRes.data.success) {
      console.log("✅ Tenant profile saved successfully!");
    } else {
      throw new Error("Save profile failed");
    }

    // ----------------------------------------------------
    // TEST 6: Get Compatibility Score
    // ----------------------------------------------------
    console.log("\n➡️ Test 6: Requesting AI Compatibility Score...");
    const compatibilityRes = await axios.get(
      `${BASE_URL}/compatibility/${listingId}`,
      {
        headers: { Authorization: `Bearer ${tenantToken}` },
      }
    );
    if (compatibilityRes.data.success) {
      console.log(
        `✅ Score calculated: ${compatibilityRes.data.data.score}%`
      );
      console.log(`💬 Explanation: ${compatibilityRes.data.data.explanation}`);
    } else {
      throw new Error("AI compatibility lookup failed");
    }

    // ----------------------------------------------------
    // TEST 7: Express Interest (Tenant)
    // ----------------------------------------------------
    console.log("\n➡️ Test 7: Expressing Room Interest...");
    const interestRes = await axios.post(
      `${BASE_URL}/interests/${listingId}`,
      {},
      {
        headers: { Authorization: `Bearer ${tenantToken}` },
      }
    );
    if (interestRes.data.success) {
      interestId = interestRes.data.data.id;
      console.log(`✅ Interest expressed! Request ID: ${interestId}`);
    } else {
      throw new Error("Failed to express interest");
    }

    // ----------------------------------------------------
    // TEST 8: Accept Interest Request (Owner)
    // ----------------------------------------------------
    console.log("\n➡️ Test 8: Accepting Interest Request...");
    const acceptRes = await axios.put(
      `${BASE_URL}/interests/${interestId}`,
      { status: "ACCEPTED" },
      {
        headers: { Authorization: `Bearer ${ownerToken}` },
      }
    );
    if (acceptRes.data.success) {
      console.log("✅ Interest request accepted! Chat portal is now open.");
    } else {
      throw new Error("Failed to accept interest");
    }

    console.log("\n⭐️ ALL BACKEND API INTEGRATION TESTS PASSED SUCCESSFULY! ⭐️");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.response?.data || error.message);
    process.exit(1);
  }
};

testApi();
