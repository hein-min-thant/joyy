"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { Badge, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function CoinsPage() {
    const packages = useQuery(api.coinPackages.list);

    const handlePurchase = (pkg: any) => {
        toast.info(`${pkg.name} package will be available soon. Contact admin for manual top-up.`);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 sm:px-8 lg:px-20 py-6 sm:py-10 max-w-6xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">Buy Coins</h1>
                    <p className="text-default-600">
                        Purchase coins to unlock premium manga and comics
                    </p>
                </div>

                {!packages ? (
                    <div className="text-center py-12">Loading packages...</div>
                ) : packages.length === 0 ? (
                    <div className="text-center py-12">
                        <Card className="max-w-md mx-auto">
                            <CardBody className="py-8 text-center">
                                <Coins className="h-16 w-16 mx-auto mb-4 text-default-400" />
                                <h3 className="text-lg font-semibold mb-2">No Packages Available</h3>
                                <p className="text-sm text-default-600 mb-4">
                                    Coin packages will be available soon. Contact an admin for manual top-up.
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <Card
                                key={pkg._id}
                                className={`relative ${pkg.popular ? "border-primary border-2" : ""}`}
                            >
                                {pkg.popular && (
                                    <Chip
                                        color="primary"
                                        variant="solid"
                                        startContent={<Sparkles className="h-3 w-3" />}
                                        className="absolute top-3 right-3 z-10 font-bold"
                                    >
                                        POPULAR
                                    </Chip>
                                )}
                                <CardHeader className="flex-col items-start pb-0">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-6 w-6 text-primary" />
                                        <h3 className="text-xl font-bold">{pkg.name}</h3>
                                    </div>
                                </CardHeader>
                                <CardBody className="space-y-6 pt-6">
                                    <div className="text-center py-4">
                                        <div className="text-4xl font-bold text-primary mb-2">
                                            {pkg.coins.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-default-600">Coins</div>
                                        {pkg.bonus > 0 && (
                                            <Chip color="secondary" variant="flat" className="mt-2">
                                                +{pkg.bonus} Bonus Coins
                                            </Chip>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-1">
                                            {pkg.price.toLocaleString()} MMK
                                        </div>
                                        <div className="text-xs text-default-600">
                                            {((pkg.price / (pkg.coins + pkg.bonus)) * 1).toFixed(2)} MMK per coin
                                        </div>
                                    </div>
                                    <Button
                                        fullWidth
                                        size="lg"
                                        color="primary"
                                        onPress={() => handlePurchase(pkg)}
                                    >
                                        Purchase
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center text-sm text-default-600">
                    <p>Need help? Contact an admin for manual coin top-up</p>
                </div>
            </main>
        </div>
    );
}
