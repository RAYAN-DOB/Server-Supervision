-- AddColumn Equipment.modelReference
-- Référence exacte du produit Black Box (ex: EME1-168A, EME1TH2-005)
ALTER TABLE "Equipment" ADD COLUMN "modelReference" TEXT;
CREATE INDEX "Equipment_modelReference_idx" ON "Equipment"("modelReference");
