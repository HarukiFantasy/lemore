import { browserClient } from '~/supa-client';
import type { LgbListing, Language } from '../types';

/**
 * Save generated listings to the database
 * @param listings - Array of listings to save
 * @param sessionId - Optional session ID for standalone listings
 */
export async function saveListingsToDatabase(listings: LgbListing[], sessionId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Saving listings to database:', listings);

    if (!listings || listings.length === 0) {
      return { success: true }; // Nothing to save
    }

    // For standalone listings (when item_id is a generated UUID), create placeholder items first
    const standaloneListings = listings.filter(listing => 
      listing.item_id && !listing.item_id.startsWith('lgb_item_')
    );

    for (const listing of standaloneListings) {
      // Check if this item_id already exists
      const { data: existingItem } = await browserClient
        .from('lgb_items')
        .select('item_id')
        .eq('item_id', listing.item_id)
        .single();

      if (!existingItem) {
        // Create a placeholder item for standalone listings
        const { error: itemError } = await browserClient
          .from('lgb_items')
          .insert({
            item_id: listing.item_id,
            session_id: sessionId || crypto.randomUUID(), // Use provided session ID or generate one
            title: listing.title,
            category: 'Generated Listing',
            condition: 'Unknown',
            ai_recommendation: 'sell',
            ai_rationale: 'Generated through Quick Listing Generator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (itemError) {
          console.error('Error creating placeholder item:', itemError);
          return { success: false, error: `Failed to create placeholder item: ${itemError.message}` };
        }
      }
    }

    // Prepare data for database insertion
    const listingInserts = listings.map(listing => ({
      listing_id: listing.listing_id,
      item_id: listing.item_id,
      lang: listing.lang,
      title: listing.title,
      body: listing.body,
      hashtags: listing.hashtags,
      channels: listing.channels || [],
      created_at: listing.created_at
    }));

    // Insert listings into database
    const { data, error } = await browserClient
      .from('lgb_listings')
      .insert(listingInserts)
      .select();

    if (error) {
      console.error('Error saving listings to database:', error);
      return { success: false, error: error.message };
    }

    console.log('Successfully saved listings to database:', data);
    return { success: true };

  } catch (error) {
    console.error('Unexpected error saving listings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get listings for a specific item from the database
 */
export async function getListingsForItem(itemId: string): Promise<{ listings: LgbListing[]; error?: string }> {
  try {
    const { data, error } = await browserClient
      .from('lgb_listings')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings for item:', error);
      return { listings: [], error: error.message };
    }

    return { 
      listings: (data || []).map(listing => ({
        listing_id: listing.listing_id,
        item_id: listing.item_id,
        lang: listing.lang as Language,
        title: listing.title,
        body: listing.body,
        hashtags: listing.hashtags || [],
        channels: listing.channels || [],
        created_at: listing.created_at || new Date().toISOString()
      }))
    };

  } catch (error) {
    console.error('Unexpected error fetching listings:', error);
    return { 
      listings: [], 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Delete a listing from the database
 */
export async function deleteListing(listingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await browserClient
      .from('lgb_listings')
      .delete()
      .eq('listing_id', listingId);

    if (error) {
      console.error('Error deleting listing:', error);
      return { success: false, error: error.message };
    }

    console.log('Successfully deleted listing:', listingId);
    return { success: true };

  } catch (error) {
    console.error('Unexpected error deleting listing:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}