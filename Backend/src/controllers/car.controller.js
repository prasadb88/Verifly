import asyncHandler from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Car } from "../models/car.model.js";
import { uploadOncloudinary, deleteOnCloudinary } from "../utils/Cloudinary.js";


const Addcar = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(400, "User Not Found")
    }
    // console.log("Logged in user role:", user.role); 
    if (user.role !== "dealer" && user.role !== "admin") {
        throw new ApiError(400, "You are not authorized to add a car please Change your role")
    }
    const { maker, model, year, color
        , price, brand, mileage,
        transmission, fueltype, registrationnumber,
        owner, damage, insurance, insurancevalidity,
        insurancecompany, insurancepremium, insurancestatus,
        chassisnumber, enginenumber, registrationdate,
        registrationplace } = req.body

    if (!maker || !model || !year || !color || !price || !brand || !mileage || !transmission || !fueltype || !registrationnumber) {
        throw new ApiError(400, "These fields are required")
    }
    console.log(req.files);


    // Check for main images
    const mainFiles = req.files['images'];
    const damageFiles = req.files['damageImages'] || [];

    if (!mainFiles || mainFiles.length === 0) {
        throw new ApiError(400, "At least one main car image is required")
    }

    const images = [];
    const damageImages = [];

    // Upload Main Images
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
        registrationplace
    })

    return res.status(200).
        json(new ApiResponse(200, car, "Car Added Scessfully"))

})

const getallcars = asyncHandler(async (req, res) => {
    const cars = await Car.find({}).populate("delear", "username email phoneno")
    if (!cars) {
        throw new ApiError(400, "No Cars Are Present")
    }

    return res.status(200).
        json(new ApiResponse(200, cars, "all cars Fetch Sucessfully"))
    return res.status(200).
        json(new ApiResponse(200, cars, "all cars Fetch Sucessfully"))
})

const getDealerCars = asyncHandler(async (req, res) => {
    // req.user is populated by jwtverify middleware
    const dealerId = req.user._id;
    console.log(`DEBUG: Fetching cars for dealer: ${dealerId}`);

    let cars = await Car.find({ delear: dealerId });
    if (cars.length === 0) {
        console.log("DEBUG: No cars found with ObjectId, trying String ID match");
        cars = await Car.find({ delear: dealerId.toString() });
    }
    console.log(`DEBUG: Found ${cars?.length || 0} cars for dealer ${dealerId}`);

    if (!cars) {
        // Should not happen with Mongoose find, but safe guard
        cars = [];
    }

    return res.status(200)
        .json(new ApiResponse(200, cars, "Dealer cars fetched successfully"));
});

const updatecar = asyncHandler(async (req, res) => {
    const { id } = req.params
    const car = await Car.findById(id)
    if (!car) {
        throw new ApiError(400, "Car Not Found")
    }

    // Authorization check: Only owner (dealer) or admin can update
    if (car.delear.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update this car");
    }

    const { maker, model, year, color, price, brand, images, mileage, transmission, fueltype, registrationnumber, owner, damage, insurance, insurancevalidity, insurancecompany, insurancepremium, insurancestatus, chassisnumber, enginenumber, registrationdate, registrationplace } = req.body
    car.maker = maker
    car.model = model
    car.year = year
    car.color = color
    car.price = price
    car.brand = brand
    car.images = images
    car.mileage = mileage
    car.transmission = transmission
    car.fueltype = fueltype
    car.registrationnumber = registrationnumber
    car.owner = owner
    car.damage = damage
    car.insurance = insurance
    car.insurancevalidity = insurancevalidity
    car.insurancecompany = insurancecompany
    car.insurancepremium = insurancepremium
    car.insurancestatus = insurancestatus
    car.chassisnumber = chassisnumber
    car.enginenumber = enginenumber
    car.registrationdate = registrationdate
    car.registrationplace = registrationplace
    await car.save()
    return res.status(200).json(new ApiResponse(200, car, "Car Updated Successfully"))
})

const deletecar = asyncHandler(async (req, res) => {
    const carId = req.params.id
    const car = await Car.findById(carId)
    if (!car) {
        throw new ApiError(400, "Car Not Found")
    }

    // Authorization check: Only owner (dealer) or admin can delete
    if (car.delear.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete this car");
    }

    // Collect all images to delete
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

    // Process deletion
    await Promise.all(imagesToDelete.map(async (imageUrl) => {
        try {
            if (!imageUrl) return;

            const parts = imageUrl.split('/');
            const filenameWithExt = parts.pop();
            const folder = parts.pop();

            const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;

            await deleteOnCloudinary(publicId);
        } catch (e) {
            console.error(`Failed to delete image ${imageUrl}:`, e);
            allDeleted = false;
        }
    }));

    const deletedcar = await Car.findByIdAndDelete(carId)
    if (!deletedcar) {
        throw new ApiError(400, "Problem In Delete The Car")
    }

    if (!allDeleted) {
        // We still return success but maybe log it? The user mostly cares that the car is gone.
        console.warn("Car deleted, but some images may not have been removed from Cloudinary");
    }

    return res.status(200).
        json(new ApiResponse(200, "", "Car and associated images deleted successfully"))
})


const getcar = asyncHandler(async (req, res) => {
    const carId = req.params.id

    const car = await Car.findById(carId).populate("delear", "username email phoneno address name profileImage")
    if (!car) {
        throw new ApiError(400, "Error Whilw fetching Car")
    }

    return res.status(200).
        json(new ApiResponse(200, car, "car Fetch Sucessfully"))

})


export { Addcar, getallcars, updatecar, deletecar, getcar, getDealerCars }
