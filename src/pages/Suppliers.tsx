import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Edit2, Building, AlertCircle, Package, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc,
  Timestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { InventoryItem } from "@/types/inventory";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalAmount: number;
  availableItems: string[]; // Array of inventory item IDs
  createdAt: Date;
  updatedAt: Date;
}

const Suppliers = () => {
  const [user, loading, authError] = useAuthState(auth);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "Net 30",
    status: "active",
    availableItems: [],
  });
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  // Load inventory items
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    console.log("Loading inventory items for supplier selection");
    const q = query(collection(db, "inventory"), orderBy("name", "asc"));
    
    const unsubscribe = onSnapshot(
      q, 
      (querySnapshot) => {
        const fetchedItems: InventoryItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedItems.push({
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            quantity: data.quantity || 0,
            imageUrl: data.imageUrl || '',
            sku: data.sku || '',
            category: data.category || '',
            costPrice: data.costPrice || 0,
            reorderLevel: data.reorderLevel || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as InventoryItem);
        });
        
        setInventoryItems(fetchedItems);
      }, 
      (error) => {
        console.error("Error fetching inventory items:", error);
      }
    );
    
    return () => unsubscribe();
  }, [user, loading]);

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (!user) {
      setError("You must be logged in to view suppliers.");
      setIsLoading(false);
      return;
    }

    console.log("Suppliers: Setting up real-time listener for user:", user.uid);
    setError(null);
    
    const q = query(collection(db, "suppliers"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q, 
      (querySnapshot) => {
        console.log("Suppliers: Received data", querySnapshot.size, "suppliers");
        const fetchedSuppliers: Supplier[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Suppliers: Processing supplier", doc.id, data);
          
          fetchedSuppliers.push({
            id: doc.id,
            name: data.name || '',
            contactPerson: data.contactPerson || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            paymentTerms: data.paymentTerms || 'Net 30',
            status: data.status || 'active',
            totalOrders: data.totalOrders || 0,
            totalAmount: data.totalAmount || 0,
            availableItems: data.availableItems || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Supplier);
        });
        
        console.log("Suppliers: Total suppliers loaded:", fetchedSuppliers.length);
        setSuppliers(fetchedSuppliers);
        setIsLoading(false);
        setError(null);
      }, 
      (error) => {
        console.error("Suppliers: Error fetching suppliers:", error);
        let errorMessage = "Failed to load suppliers.";
        
        if (error.code === 'permission-denied') {
          errorMessage = "Access denied. Please check your permissions or contact an administrator.";
        } else if (error.code === 'unavailable') {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        }
        
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    
    return () => {
      console.log("Suppliers: Cleaning up listener");
      unsubscribe();
    };
  }, [user, loading, toast]);

  const resetNewSupplier = () => {
    setNewSupplier({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "Net 30",
      status: "active",
      availableItems: [],
    });
  };

  const handleAddSupplier = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add suppliers.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!newSupplier.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Supplier name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!newSupplier.contactPerson?.trim()) {
      toast({
        title: "Validation Error",
        description: "Contact person is required.",
        variant: "destructive",
      });
      return;
    }

    // Email validation if provided
    if (newSupplier.email && newSupplier.email.trim() && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplier.email.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Suppliers: Adding new supplier", newSupplier);
      const currentTime = Timestamp.now();
      
      const supplierData = {
        name: newSupplier.name.trim(),
        contactPerson: newSupplier.contactPerson.trim(),
        email: newSupplier.email?.trim() || '',
        phone: newSupplier.phone?.trim() || '',
        address: newSupplier.address?.trim() || '',
        paymentTerms: newSupplier.paymentTerms || 'Net 30',
        status: newSupplier.status || 'active',
        totalOrders: 0,
        totalAmount: 0,
        availableItems: newSupplier.availableItems || [],
        createdAt: currentTime,
        updatedAt: currentTime,
        userId: user.uid,
      };

      const docRef = await addDoc(collection(db, "suppliers"), supplierData);
      
      console.log("Suppliers: Successfully added supplier with ID:", docRef.id);
      
      resetNewSupplier();
      setAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Supplier has been added successfully.",
      });
    } catch (error: any) {
      console.error("Suppliers: Error adding supplier:", error);
      let errorMessage = "Failed to add supplier. Please try again.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. You don't have access to add suppliers.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSupplier = async () => {
    if (!editSupplier || !user) return;

    // Validation
    if (!editSupplier.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Supplier name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!editSupplier.contactPerson?.trim()) {
      toast({
        title: "Validation Error",
        description: "Contact person is required.",
        variant: "destructive",
      });
      return;
    }

    // Email validation if provided
    if (editSupplier.email && editSupplier.email.trim() && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editSupplier.email.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Suppliers: Updating supplier", editSupplier.id, editSupplier);
      const supplierRef = doc(db, "suppliers", editSupplier.id);
      const currentTime = Timestamp.now();
      
      const updateData = {
        name: editSupplier.name.trim(),
        contactPerson: editSupplier.contactPerson.trim(),
        email: editSupplier.email?.trim() || '',
        phone: editSupplier.phone?.trim() || '',
        address: editSupplier.address?.trim() || '',
        paymentTerms: editSupplier.paymentTerms,
        status: editSupplier.status,
        availableItems: editSupplier.availableItems || [],
        updatedAt: currentTime,
      };

      await updateDoc(supplierRef, updateData);
      
      console.log("Suppliers: Successfully updated supplier");
      setEditDialogOpen(false);
      setEditSupplier(null);
      
      toast({
        title: "Success",
        description: "Supplier has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Suppliers: Error updating supplier:", error);
      let errorMessage = "Failed to update supplier. Please try again.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. You don't have access to update suppliers.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditSupplier({...supplier});
    setEditDialogOpen(true);
  };

  const openItemsDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setItemsDialogOpen(true);
  };

  const toggleItemForSupplier = (itemId: string, isForNewSupplier: boolean = false) => {
    if (isForNewSupplier) {
      const currentItems = newSupplier.availableItems || [];
      if (currentItems.includes(itemId)) {
        setNewSupplier({
          ...newSupplier,
          availableItems: currentItems.filter(id => id !== itemId)
        });
      } else {
        setNewSupplier({
          ...newSupplier,
          availableItems: [...currentItems, itemId]
        });
      }
    } else if (editSupplier) {
      const currentItems = editSupplier.availableItems || [];
      if (currentItems.includes(itemId)) {
        setEditSupplier({
          ...editSupplier,
          availableItems: currentItems.filter(id => id !== itemId)
        });
      } else {
        setEditSupplier({
          ...editSupplier,
          availableItems: [...currentItems, itemId]
        });
      }
    }
  };

  const getItemName = (itemId: string) => {
    const item = inventoryItems.find(item => item.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (authError || (!user && !loading)) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Please log in to access the suppliers page.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  console.log("Suppliers: Rendering with", suppliers.length, "suppliers");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier information and available items
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Total Suppliers</h3>
                <p className="text-2xl font-bold text-blue-600">{suppliers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Active Suppliers</h3>
                <p className="text-2xl font-bold text-green-600">
                  {suppliers.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Total Items</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {suppliers.reduce((sum, s) => sum + (s.availableItems?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto" disabled={!user}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter the details for the new supplier and select available items.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={newSupplier.name || ""}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter supplier name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactPerson" className="text-right">
                    Contact *
                  </Label>
                  <Input
                    id="contactPerson"
                    value={newSupplier.contactPerson || ""}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter contact person"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSupplier.email || ""}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={newSupplier.phone || ""}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={newSupplier.address || ""}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter address"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentTerms" className="text-right">
                    Payment Terms
                  </Label>
                  <Select
                    value={newSupplier.paymentTerms || "Net 30"}
                    onValueChange={(value) => setNewSupplier({ ...newSupplier, paymentTerms: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 7">Net 7</SelectItem>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                      <SelectItem value="Prepaid">Prepaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">
                    Available Items
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                      {inventoryItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`item-${item.id}`}
                            checked={(newSupplier.availableItems || []).includes(item.id)}
                            onChange={() => toggleItemForSupplier(item.id, true)}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`item-${item.id}`} className="text-sm">
                            {item.name} ({item.sku})
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select items that this supplier can provide
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAddDialogOpen(false);
                    resetNewSupplier();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Supplier"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Available Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Building className="h-12 w-12 mb-2" />
                      <h3 className="text-lg font-medium">No suppliers found</h3>
                      <p>{searchTerm ? "Try adjusting your search terms." : "Add your first supplier to get started."}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(supplier.availableItems || []).slice(0, 2).map((itemId) => (
                          <Badge key={itemId} variant="secondary" className="text-xs">
                            {getItemName(itemId)}
                          </Badge>
                        ))}
                        {(supplier.availableItems || []).length > 2 && (
                          <Badge variant="outline" className="text-xs cursor-pointer"
                                 onClick={() => openItemsDialog(supplier)}>
                            +{(supplier.availableItems || []).length - 2} more
                          </Badge>
                        )}
                        {(supplier.availableItems || []).length === 0 && (
                          <span className="text-muted-foreground text-sm">No items</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {supplier.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openItemsDialog(supplier)}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Supplier Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the supplier information and available items.
            </DialogDescription>
          </DialogHeader>
          {editSupplier && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="edit-name"
                  value={editSupplier.name}
                  onChange={(e) => setEditSupplier({ ...editSupplier, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contactPerson" className="text-right">
                  Contact *
                </Label>
                <Input
                  id="edit-contactPerson"
                  value={editSupplier.contactPerson}
                  onChange={(e) => setEditSupplier({ ...editSupplier, contactPerson: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editSupplier.email}
                  onChange={(e) => setEditSupplier({ ...editSupplier, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={editSupplier.phone}
                  onChange={(e) => setEditSupplier({ ...editSupplier, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Address
                </Label>
                <Textarea
                  id="edit-address"
                  value={editSupplier.address}
                  onChange={(e) => setEditSupplier({ ...editSupplier, address: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-paymentTerms" className="text-right">
                  Payment Terms
                </Label>
                <Select
                  value={editSupplier.paymentTerms}
                  onValueChange={(value) => setEditSupplier({ ...editSupplier, paymentTerms: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 7">Net 7</SelectItem>
                    <SelectItem value="COD">Cash on Delivery</SelectItem>
                    <SelectItem value="Prepaid">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editSupplier.status}
                  onValueChange={(value: 'active' | 'inactive') => setEditSupplier({ ...editSupplier, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">
                  Available Items
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                    {inventoryItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-item-${item.id}`}
                          checked={(editSupplier.availableItems || []).includes(item.id)}
                          onChange={() => toggleItemForSupplier(item.id, false)}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`edit-item-${item.id}`} className="text-sm">
                          {item.name} ({item.sku})
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select items that this supplier can provide
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditDialogOpen(false);
                setEditSupplier(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSupplier} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Items Dialog */}
      <Dialog open={itemsDialogOpen} onOpenChange={setItemsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Available Items</DialogTitle>
            <DialogDescription>
              Items available from {selectedSupplier?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedSupplier && (selectedSupplier.availableItems || []).length > 0 ? (
              <div className="space-y-2">
                {(selectedSupplier.availableItems || []).map((itemId) => (
                  <div key={itemId} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{getItemName(itemId)}</span>
                    <Badge variant="secondary">
                      {inventoryItems.find(item => item.id === itemId)?.sku || 'N/A'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <p>No items available from this supplier</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setItemsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Suppliers;
