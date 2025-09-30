-- =============================================
-- CATEGORIES GAME RLS POLICIES UPDATE
-- =============================================
-- Add missing policies for admin operations
-- Run this after the main categories game schema
-- =============================================

-- Allow authenticated users to insert new game templates (admin functionality)
CREATE POLICY "Authenticated users can create templates" ON public.category_game_templates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow template creators to update their own templates
CREATE POLICY "Template creators can update their templates" ON public.category_game_templates
    FOR UPDATE USING (created_by = auth.uid());

-- Allow template creators to delete (soft delete) their own templates
CREATE POLICY "Template creators can delete their templates" ON public.category_game_templates
    FOR UPDATE USING (created_by = auth.uid());

-- Allow authenticated users to insert game categories (when creating templates)
CREATE POLICY "Authenticated users can create categories" ON public.game_categories
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.category_game_templates WHERE id = template_id AND created_by = auth.uid())
    );

-- Allow category creators to update categories in their templates
CREATE POLICY "Template creators can update their categories" ON public.game_categories
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.category_game_templates WHERE id = template_id AND created_by = auth.uid())
    );

-- Allow category creators to delete categories in their templates
CREATE POLICY "Template creators can delete their categories" ON public.game_categories
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.category_game_templates WHERE id = template_id AND created_by = auth.uid())
    );

-- Allow authenticated users to insert movies
CREATE POLICY "Authenticated users can add movies" ON public.movies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update movies (for maintaining movie data)
CREATE POLICY "Users can update movie data" ON public.movies
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create template-movie associations
CREATE POLICY "Authenticated users can create template movies" ON public.template_movies
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.category_game_templates WHERE id = template_id AND created_by = auth.uid())
    );

-- Allow template creators to update their template-movie associations
CREATE POLICY "Template creators can update their template movies" ON public.template_movies
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.category_game_templates WHERE id = template_id AND created_by = auth.uid())
    );

-- Allow template creators to delete their template-movie associations
CREATE POLICY "Template creators can delete their template movies" ON public.template_movies
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.category_game_templates WHERE id = template_id AND created_by = auth.uid())
    );

-- =============================================
-- NOTES
-- =============================================
-- After running this script, authenticated users will be able to:
-- 1. Create new game templates
-- 2. Add categories to their templates  
-- 3. Add movies to the movies table
-- 4. Link movies to their template categories
-- 5. Update/delete their own templates and related data
--
-- Anonymous users can still:
-- 1. View all active templates and categories
-- 2. Play games and create sessions
-- 3. Submit attempts and track statistics
-- =============================================