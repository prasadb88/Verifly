import asyncHandler from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Car } from "../models/car.model.js";
import { uploadOncloudinary, deleteOnCloudinary } from "../utils/Cloudinary.js";


/**
 * @desc Add a new car listing 
 * @route POST /api/v1/cars/addcar
 * @access Private (Dealer/Admin)
 */
const Addcar = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(400, "User Not Found")
    }

    if (user.role !== "dealer" && user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to add a car. Use a Dealer account.")
    }
    const { maker, model, year, color
        , price, brand, mileage,
        transmission, fueltype, registrationnumber,
        owner, damage, insurance, insurancevalidity,
        insurancecompany, insurancepremium, insurancestatus,
        chassisnumber, enginenumber, registrationdate,
        registrationplace, description } = req.body

    if (!maker || !model || !year || !color || !price || !brand || !mileage || !transmission || !fueltype || !registrationnumber) {
        throw new ApiError(400, "These fields are required")
    }

    // Check for main images
    const mainFiles = req.files['images'];
    const damageFiles = req.files['damageImages'] || [];

    if (!mainFiles || mainFiles.length === 0) {
        throw new ApiError(400, "At least one main car image is required")
    }

    const images = [];
    const damageImages = [];

    // Upload Main Images
    // TODO: Consider parallel upload for better performance using Promise.all
    for (const file of mainFiles) {
        try {
            const uploadedUrl = await uploadOncloudinary(file.buffer, file.originalname);
            if (uploadedUrl) {
                images.push(uploadedUrl);
            }
        } catch (error) {
            console.error("Error uploading main car file:", error);
        }
    }

    // Upload Damage Images (if any)
    for (const file of damageFiles) {
        try {
            const uploadedUrl = await uploadOncloudinary(file.buffer, file.originalname);
            if (uploadedUrl) {
                damageImages.push(uploadedUrl);
            }
        } catch (error) {
            console.error("Error uploading damage file:", error);
        }
    }

    if (images.length === 0) {
        throw new ApiError(500, "Failed to upload car images")
    }

    const car = await Car.create({
        delear: user._id,
        maker,
        model,
        year,
        color,
        price,
        brand,
        images,
        damageImages, // New Field
        mileage,
        transmission,
        fueltype,
        registrationnumber,
        owner,
        damage,
        insurance,
        insurancevalidity,
        insurancecompany,
        insurancepremium,
        insurancestatus,
        chassisnumber,
        enginenumber,
        registrationdate,
        registrationdate,
        registrationplace,
        description
    })

    return res.status(201).
        json(new ApiResponse(201, car, "Car Added Successfully"))

})

/**
 * @desc Get all car listings
 * @route GET /api/v1/cars/
 * @access Public
 */
const getallcars = asyncHandler(async (req, res) => {
    // Populate dealer info for display consistency
    const cars = await Car.find({}).populate("delear", "username email phoneno")
    if (!cars) {
        throw new ApiError(404, "No Cars Are Present")
    }

    return res.status(200).
        json(new ApiResponse(200, cars, "All cars fetched successfully"))
})

/**
 * @desc Get cars belonging to a specific dealer
 * @route GET /api/v1/cars/dealer-cars
 * @access Private (Dealer)
 */
const getDealerCars = asyncHandler(async (req, res) => {
    // req.user is populated by jwtverify middleware
    const dealerId = req.user._id;

    let cars = await Car.find({ delear: dealerId });
    if (cars.length === 0) {
        // Fallback check using string ID if type mismatch
        cars = await Car.find({ delear: dealerId.toString() });
    }

    if (!cars) {
        cars = [];
    }

    return res.status(200)
        .json(new ApiResponse(200, cars, "Dealer cars fetched successfully"));
});

/**
 * @desc Update a car listing
 * @route PUT /api/v1/cars/:id
 * @access Private (Owner/Admin)
 */
const updatecar = asyncHandler(async (req, res) => {
    const { id } = req.params
    const car = await Car.findById(id)
    if (!car) {
        throw new ApiError(404, "Car Not Found")
    }

    // Authorization check: Only owner (dealer) or admin can update
    if (car.delear.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update this car");
    }

    // Destructure all potentially updatable fields
    const { maker, model, year, color, price, brand, images, mileage, transmission, fueltype, registrationnumber, owner, damage, insurance, insurancevalidity, insurancecompany, insurancepremium, insurancestatus, chassisnumber, enginenumber, registrationdate, registrationplace, description } = req.body

    // Apply updates if fields exist
    if (maker) car.maker = maker
    if (model) car.model = model
    if (year) car.year = year
    if (color) car.color = color
    if (price) car.price = price
    if (brand) car.brand = brand
    if (images) car.images = images
    if (mileage) car.mileage = mileage
    if (transmission) car.transmission = transmission
    if (fueltype) car.fueltype = fueltype
    if (registrationnumber) car.registrationnumber = registrationnumber
    if (owner) car.owner = owner
    if (damage) car.damage = damage
    if (description) car.description = description

    // Insurance & Registration Details
    if (insurance) car.insurance = insurance
    if (insurancevalidity) car.insurancevalidity = insurancevalidity
    if (insurancecompany) car.insurancecompany = insurancecompany
    if (insurancepremium) car.insurancepremium = insurancepremium
    if (insurancestatus) car.insurancestatus = insurancestatus
    if (chassisnumber) car.chassisnumber = chassisnumber
    if (enginenumber) car.enginenumber = enginenumber
    if (registrationdate) car.registrationdate = registrationdate
    if (registrationplace) car.registrationplace = registrationplace

    await car.save()
    return res.status(200).json(new ApiResponse(200, car, "Car Updated Successfully"))
})

/**
 * @desc Delete a car listing and its images
 * @route DELETE /api/v1/cars/:id
 * @access Private (Owner/Admin)
 */
const deletecar = asyncHandler(async (req, res) => {
    const carId = req.params.id
    const car = await Car.findById(carId)
    if (!car) {
        throw new ApiError(404, "Car Not Found")
    }

    // Authorization check: Only owner (dealer) or admin can delete
    if (car.delear.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete this car");
    }

    // Collect all images to delete from Cloudinary
    const imagesToDelete = [];
    if (Array.isArray(car.images)) {
        imagesToDelete.push(...car.images);
    } else if (typeof car.images === 'string' && car.images) {
        imagesToDelete.push(car.images);
    }

    if (Array.isArray(car.damageImages)) {
        imagesToDelete.push(...car.damageImages);
    } else if (typeof car.damageImages === 'string' && car.damageImages) {
        imagesToDelete.push(car.damageImages);
    }

    let allDeleted = true;

    // Process deletion from Cloudinary
    await Promise.all(imagesToDelete.map(async (imageUrl) => {
        try {
            if (!imageUrl) return;

            const parts = imageUrl.split('/');
            const filenameWithExt = parts.pop();
            const folder = parts.pop(); // typically 'verifly-cars' or similar

            // Extract public ID (requires folder/filename logic dependent on setup)
            const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;

            await deleteOnCloudinary(publicId);
        } catch (e) {
            console.error(`Failed to delete image ${imageUrl}:`, e);
            allDeleted = false;
        }
    }));

    const deletedcar = await Car.findByIdAndDelete(carId)
    if (!deletedcar) {
        throw new ApiError(500, "Problem while deleting the car record")
    }

    if (!allDeleted) {
        // Log warning for cleanup service later if needed
        console.warn("Car deleted, but some images may not have been removed from Cloudinary");
    }

    return res.status(200).
        json(new ApiResponse(200, "", "Car and associated images deleted successfully"))
})


/**
 * @desc Get single car details
 * @route GET /api/v1/cars/:id
 * @access Public
 */
const getcar = asyncHandler(async (req, res) => {
    const carId = req.params.id

    const car = await Car.findById(carId).populate("delear", "username email phoneno address name profileImage")
    if (!car) {
        throw new ApiError(404, "Car Not Found")
    }

    return res.status(200).
        json(new ApiResponse(200, car, "Car Fetched Successfully"))

})


/**
 * @desc Get Mock RC Details
 * @route GET /api/v1/cars/rc/:registrationnumber
 * @access Public
 */
const getRcDetails = asyncHandler(async (req, res) => {
    const { registrationnumber } = req.params;

    // Regex for Indian Vehicle Registration Number (e.g., MH12AB1234 or MH 12 AB 1234)
    const indianRegRegex = /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{4}$/;

    if (!indianRegRegex.test(registrationnumber.toUpperCase())) {
        throw new ApiError(400, "Invalid Registration Number Format. Example: MH12AB1234");
    }

    // Mock Data Response
    const mockData = {
        registrationnumber: registrationnumber.toUpperCase(),
        chassisnumber: "MAT456789" + Math.floor(Math.random() * 100000),
        enginenumber: "ENG987654" + Math.floor(Math.random() * 100000),
        registrationdate: "2022-05-15",
        registrationplace: "Pune RTO",
        owner: "First Owner",
        insurance: {
            type: "Comprehensive",
            validity: "2025-05-14",
            company: "HDFC Ergo",
            premium: "15000",
            status: "Active"
        },
        // Flat structure as requested for some fields to match frontend expectation or model
        insurancevalidity: "2025-05-14",
        insurancecompany: "HDFC Ergo",
        insurancepremium: "15000",
        insurancestatus: "Active"
    };

    return res.status(200)
        .json(new ApiResponse(200, mockData, "RC Details Fetched Successfully"));
});


export { Addcar, getallcars, updatecar, deletecar, getcar, getDealerCars, getRcDetails }
