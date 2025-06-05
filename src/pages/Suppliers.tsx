
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
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Edit2, Building } from "lucide-react";
import { db } from "@/lib/firebase";
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
  createdAt: Date;
  updatedAt: Date;
}

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "Net 30",
    status: "active",
    totalOrders: 0,
    totalAmount: 0,
  });
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Suppliers: Setting up real-time listener");
    
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
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Supplier);
        });
        
        console.log("Suppliers: Total suppliers loaded:", fetchedSuppliers.length);
        setSuppliers(fetchedSuppliers);
        setIsLoading(false);
      }, 
      (error) => {
        console.error("Suppliers: Error fetching suppliers:", error);
        toast({
          title: "Error",
          description: "Failed to load suppliers. Check console for details.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    
    return () => {
      console.log("Suppliers: Cleaning up listener");
      unsubscribe();
    };
  }, [toast]);

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.contactPerson) {
      toast({
        title: "Validation Error",
        description: "Please fill in at least the name and contact person.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Suppliers: Adding new supplier", newSupplier);
      const currentTime = Timestamp.now();
      
      const docRef = await addDoc(collection(db, "suppliers"), {
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson,
        email: newSupplier.email || '',
        phone: newSupplier.phone || '',
        address: newSupplier.address || '',
        paymentTerms: newSupplier.paymentTerms || 'Net 30',
        status: newSupplier.status || 'active',
        totalOrders: 0,
        totalAmount: 0,
        createdAt: currentTime,
        updatedAt: currentTime,
      });
      
      console.log("Suppliers: Successfully added supplier with ID:", docRef.id);
      
      setNewSupplier({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        paymentTerms: "Net 30",
        status: "active",
        totalOrders: 0,
        totalAmount: 0,
      });
      
      setAddDialogOpen(false);
      
      toast({
        title: "Supplier Added",
        description: "The supplier has been added successfully.",
      });
    } catch (error) {
      console.error("Suppliers: Error adding supplier:", error);
      toast({
        title: "Error",
        description: "Failed to add supplier. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleEditSupplier = async () => {
    if (!editSupplier || !editSupplier.name || !editSupplier.contactPerson) {
      toast({
        title: "Validation Error",
        description: "Please fill in at least the name and contact person.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Suppliers: Updating supplier", editSupplier.id, editSupplier);
      const supplierRef = doc(db, "suppliers", editSupplier.id);
      const currentTime = Timestamp.now();
      
      await updateDoc(supplierRef, {
        name: editSupplier.name,
        contactPerson: editSupplier.contactPerson,
        email: editSupplier.email,
        phone: editSupplier.phone,
        address: editSupplier.address,
        paymentTerms: editSupplier.paymentTerms,
        status: editSupplier.status,
        updatedAt: currentTime,
      });
      
      console.log("Suppliers: Successfully updated supplier");
      setEditDialogOpen(false);
      
      toast({
        title: "Supplier Updated",
        description: "The supplier has been updated successfully.",
      });
    } catch (error) {
      console.error("Suppliers: Error updating supplier:", error);
      toast({
        title: "Error",
        description: "Failed to update supplier. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditSupplier({...supplier});
    setEditDialogOpen(true);
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Suppliers: Rendering with", suppliers.length, "suppliers");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier information and relationships
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
              <Building className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Total Orders</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}
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
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter the details for the new supplier.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactPerson" className="text-right">
                    Contact *
                  </Label>
                  <Input
                    id="contactPerson"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSupplier}>Add Supplier</Button>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
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
                      <p>Add your first supplier to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {supplier.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{supplier.totalOrders}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(supplier)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                      </Button>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the supplier information.
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
                  required
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
                  required
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
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditSupplier}>Update Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Suppliers;
