"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApp } from "@/components/providers/AppProvider";
import { ingredientsFromText, productInputSchema, type ProductInput } from "@/lib/skincare/product-validation";
import { createId } from "@/lib/state/model";
import { upsertProduct } from "@/lib/state/model";
import type { IngredientClass, Product } from "@/lib/skincare/types";

const CLASSES: IngredientClass[] = ["retinoid", "exfoliant-acid", "benzoyl-peroxide", "vitamin-c", "fragrance"];

function toInput(product?: Product): ProductInput {
  if (!product) {
    return {
      name: "",
      brand: "",
      category: "moisturizer",
      status: "in-use",
      ingredientText: "",
      ingredientListStatus: "unknown",
      provenanceSource: "user-label",
      provenanceDetail: "Typed from the package.",
      confirmedFromLabel: false,
      applicationPeriod: "both",
      prescription: false,
      remaining: "unknown",
      newProduct: true,
      doNotCombineWith: [],
    };
  }
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    status: product.status,
    ingredientText: product.ingredients.map((ingredient) => ingredient.name).join("\n"),
    ingredientListStatus: product.ingredientListStatus,
    provenanceSource: product.provenance.source,
    provenanceDetail: product.provenance.detail,
    confirmedFromLabel: product.ingredientListStatus === "user-confirmed",
    texture: product.texture,
    instructions: product.instructions,
    frequency: product.frequency,
    amountGuidance: product.amountGuidance,
    waitTime: product.waitTime,
    applicationPeriod: product.applicationPeriod,
    prescription: product.prescription,
    prescriberInstructions: product.prescriberInstructions,
    doNotCombineWith: product.doNotCombineWith ?? [],
    timesPerWeek: product.schedule?.timesPerWeek,
    scheduleExact: product.schedule?.exact,
    schedulePeriod: product.schedule?.period,
    spf: product.spf,
    broadSpectrum: product.broadSpectrum,
    waterResistant: product.waterResistant,
    waterResistantMinutes: product.waterResistantMinutes,
    purchaseDate: product.purchaseDate,
    openedDate: product.openedDate,
    expiryDate: product.expiryDate,
    paoMonths: product.paoMonths,
    remaining: product.remaining,
    moisturizerWeight: product.moisturizerWeight,
    newProduct: product.newProduct,
    benefitsText: product.benefits.join(", "),
  };
}

export function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter();
  const { update } = useApp();
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [labelNote, setLabelNote] = useState<string | null>(null);
  const [labelImage, setLabelImage] = useState<string | undefined>(product?.labelImageDataUrl);
  const form = useForm<ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues: toInput(product),
  });

  const onSubmit = form.handleSubmit((values) => {
    const now = new Date().toISOString();
    const next: Product = {
      id: product?.id ?? createId("product"),
      name: values.name,
      brand: values.brand,
      category: values.category,
      status: values.status,
      ingredients: ingredientsFromText(values.ingredientText),
      ingredientListStatus: values.ingredientListStatus,
      provenance: {
        source: values.provenanceSource,
        detail: values.provenanceDetail,
        retrievedAt: now,
      },
      benefits: (values.benefitsText ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      texture: values.texture,
      instructions: values.instructions,
      frequency: values.frequency,
      amountGuidance: values.amountGuidance,
      waitTime: values.waitTime,
      applicationPeriod: values.applicationPeriod,
      prescription: values.prescription,
      prescriberInstructions: values.prescriberInstructions,
      doNotCombineWith: values.doNotCombineWith,
      schedule:
        values.timesPerWeek || values.scheduleExact
          ? {
              period: values.schedulePeriod ?? (values.applicationPeriod === "am" ? "am" : "pm"),
              timesPerWeek: values.timesPerWeek,
              exact: Boolean(values.scheduleExact || values.prescription),
            }
          : undefined,
      spf: values.spf ?? null,
      broadSpectrum: values.broadSpectrum ?? null,
      waterResistant: values.waterResistant ?? null,
      waterResistantMinutes: values.waterResistantMinutes ?? null,
      purchaseDate: values.purchaseDate,
      openedDate: values.openedDate,
      expiryDate: values.expiryDate,
      paoMonths: values.paoMonths ?? null,
      remaining: values.remaining,
      reactions: product?.reactions ?? [],
      newProduct: values.newProduct,
      moisturizerWeight: values.moisturizerWeight ?? null,
      barcode: product?.barcode,
      labelImageDataUrl: labelImage,
      createdAt: product?.createdAt ?? now,
      updatedAt: now,
    };
    update((current) => upsertProduct(current, next));
    router.push(`/shelf/${next.id}`);
  });

  async function scanBarcode() {
    const Detector = (window as Window & { BarcodeDetector?: new () => { detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setScanMessage("This browser has no barcode detector. Type the code from the package instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      const detector = new Detector();
      const codes = await detector.detect(video);
      stream.getTracks().forEach((track) => track.stop());
      const value = codes[0]?.rawValue;
      if (!value) {
        setScanMessage("No barcode was read. You can type it instead. Nothing was looked up from the code.");
        return;
      }
      setScanMessage(`Code ${value} was read. It was not matched to a product database. Confirm the name and ingredients yourself.`);
      form.setValue("name", form.getValues("name") || value);
    } catch {
      setScanMessage("The camera could not be used. You can still type the product in.");
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_200_000) {
      setLabelNote("That photo is over 1.2 MB. It stays off the device store. Type the ingredients instead.");
      return;
    }
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the photo."));
      reader.readAsDataURL(file);
    });
    setLabelImage(dataUrl);
    setLabelNote("Photo stored only on this device. It is not an ingredient list until you confirm the text.");
    form.setValue("ingredientListStatus", "extracted-unconfirmed");
    form.setValue("provenanceSource", "extracted");
  }

  const errors = form.formState.errors;

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Name
          <input className="field mt-1" {...form.register("name")} />
          {errors.name ? <span className="mt-1 block text-xs text-block">{errors.name.message}</span> : null}
        </label>
        <label className="text-sm">
          Brand
          <input className="field mt-1" {...form.register("brand")} />
          {errors.brand ? <span className="mt-1 block text-xs text-block">{errors.brand.message}</span> : null}
        </label>
        <label className="text-sm">
          Category
          <select className="field mt-1" {...form.register("category")}>
            {["cleanser", "toner", "serum", "treatment", "exfoliant", "moisturizer", "sunscreen", "oil", "eye", "mask", "other"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Status
          <select className="field mt-1" {...form.register("status")}>
            <option value="in-use">In use</option>
            <option value="paused">Paused</option>
            <option value="finished">Finished</option>
            <option value="discarded">Discarded</option>
          </select>
        </label>
      </div>
      <label className="text-sm">
        Ingredients, one per line or separated by commas
        <textarea className="field mt-1 min-h-32" {...form.register("ingredientText")} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Ingredient list status
          <select className="field mt-1" {...form.register("ingredientListStatus")}>
            <option value="unknown">Unknown</option>
            <option value="incomplete">Incomplete</option>
            <option value="extracted-unconfirmed">Extracted, not confirmed</option>
            <option value="user-confirmed">Confirmed from the label</option>
            <option value="manufacturer">Manufacturer disclosure</option>
            <option value="database">Database record</option>
          </select>
        </label>
        <label className="text-sm">
          Where it came from
          <select className="field mt-1" {...form.register("provenanceSource")}>
            <option value="user-label">Label I transcribed</option>
            <option value="manufacturer">Manufacturer disclosure</option>
            <option value="database">Database</option>
            <option value="extracted">Extracted text</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
      </div>
      <label className="text-sm">
        Provenance note
        <input className="field mt-1" {...form.register("provenanceDetail")} />
        {errors.provenanceDetail ? <span className="mt-1 block text-xs text-block">{errors.provenanceDetail.message}</span> : null}
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" {...form.register("confirmedFromLabel")} />
        I checked this ingredient list against the package. Unconfirmed text stays unverified.
      </label>
      {errors.confirmedFromLabel ? <p className="text-xs text-block">{errors.confirmedFromLabel.message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => void scanBarcode()}>
          Scan barcode
        </button>
        <label className="border border-line px-3 py-2 text-sm">
          Label photo
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => void onPhoto(event.target.files?.[0])}
          />
        </label>
      </div>
      {scanMessage ? <p className="text-sm text-muted">{scanMessage}</p> : null}
      {labelNote ? <p className="text-sm text-muted">{labelNote}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Texture
          <input className="field mt-1" {...form.register("texture")} placeholder="cream, gel, oil, balm" />
        </label>
        <label className="text-sm">
          When
          <select className="field mt-1" {...form.register("applicationPeriod")}>
            <option value="both">Morning and evening</option>
            <option value="am">Morning</option>
            <option value="pm">Evening</option>
            <option value="as-needed">As needed</option>
          </select>
        </label>
        <label className="text-sm">
          Instructions
          <input className="field mt-1" {...form.register("instructions")} />
        </label>
        <label className="text-sm">
          Frequency from the label
          <input className="field mt-1" {...form.register("frequency")} />
        </label>
        <label className="text-sm">
          Amount guidance
          <input className="field mt-1" {...form.register("amountGuidance")} />
        </label>
        <label className="text-sm">
          Wait time, only if the label says so
          <input className="field mt-1" {...form.register("waitTime")} />
        </label>
        <label className="text-sm">
          Moisturizer weight
          <select
            className="field mt-1"
            {...form.register("moisturizerWeight", {
              setValueAs: (value) => (value === "" || value == null ? null : value),
            })}
          >
            <option value="">Not a weighted moisturizer</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="rich">Rich</option>
          </select>
        </label>
        <label className="text-sm">
          Remaining
          <select className="field mt-1" {...form.register("remaining")}>
            {["full", "plenty", "half", "low", "empty", "unknown"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="border border-line p-3">
        <legend className="px-1 text-sm">Sunscreen label, only if the package says so</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            SPF
            <input
              className="field mt-1"
              type="number"
              {...form.register("spf", { setValueAs: (value) => (value === "" || value == null ? null : Number(value)) })}
            />
          </label>
          <label className="text-sm">
            Broad spectrum
            <select className="field mt-1" {...form.register("broadSpectrum", { setValueAs: triState })}>
              <option value="">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="text-sm">
            Water resistant
            <select className="field mt-1" {...form.register("waterResistant", { setValueAs: triState })}>
              <option value="">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
        {errors.waterResistantMinutes ? <p className="mt-2 text-xs text-block">{errors.waterResistantMinutes.message}</p> : null}
        <label className="mt-3 block text-sm">
          Minutes, 40 or 80
          <input
            className="field mt-1"
            type="number"
            {...form.register("waterResistantMinutes", {
              setValueAs: (value) => (value === "" || value == null ? null : Number(value)),
            })}
          />
        </label>
      </fieldset>
      <fieldset className="border border-line p-3">
        <legend className="px-1 text-sm">Prescription or exact schedule</legend>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("prescription")} /> Prescription product
        </label>
        <label className="mt-3 block text-sm">
          Prescriber or label instructions
          <textarea className="field mt-1" {...form.register("prescriberInstructions")} />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Days per week
            <input
              className="field mt-1"
              type="number"
              {...form.register("timesPerWeek", {
                setValueAs: (value) => (value === "" || value == null ? undefined : Number(value)),
              })}
            />
          </label>
          <label className="text-sm">
            Period
            <select className="field mt-1" {...form.register("schedulePeriod")}>
              <option value="pm">Evening</option>
              <option value="am">Morning</option>
              <option value="both">Both</option>
            </select>
          </label>
          <label className="mt-6 flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("scheduleExact")} /> Do not increase this frequency
          </label>
        </div>
        <p className="mt-3 text-xs text-muted">Label says not to combine with:</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {CLASSES.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <input type="checkbox" value={item} {...form.register("doNotCombineWith")} />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          Purchased
          <input className="field mt-1" type="date" {...form.register("purchaseDate")} />
        </label>
        <label className="text-sm">
          Opened
          <input className="field mt-1" type="date" {...form.register("openedDate")} />
        </label>
        <label className="text-sm">
          Expires
          <input className="field mt-1" type="date" {...form.register("expiryDate")} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("newProduct")} /> New to my skin
      </label>
      <label className="text-sm">
        Stated benefits, separated by commas. These are notes, not clinical results.
        <input className="field mt-1" {...form.register("benefitsText")} />
      </label>
      {Object.keys(errors).length > 0 ? (
        <p role="alert" className="text-sm text-block">
          The product was not saved. Check the fields marked below.
        </p>
      ) : null}
      <button type="submit" className="w-fit bg-ink px-4 py-2 text-sm text-bg">
        Save product
      </button>
    </form>
  );
}

function triState(value: string): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}
