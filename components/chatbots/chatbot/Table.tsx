"use client"
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { convertISODate } from '@/utils/helper';
import { ClipLoader } from 'react-spinners';
import { TrainingData } from '@/types/chatbot';
import Pagination from '@/components/common/Pagination';

type TableComponentProps = {
  getTrainings: (page?: number, limit?: number) => Promise<void>;
  fetchingTrainings: boolean;
  totalItems?: number;
  totalPages?: number;
  trainings: TrainingData[] | null | undefined;
  chatbotId: string;
};

const TableComponent = ({ 
  getTrainings,
  fetchingTrainings,
  trainings,
  chatbotId,
  totalItems = 0,
  totalPages = 1
 }: TableComponentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleteing] = useState(false)
  const itemsPerPage = 10
  
  const deleteTraining = async (trainingId: string) => {
    setIsDeleteing(true)
    try {
      const response = await fetch(`/api/chatbot-creator/training/${chatbotId}/${trainingId}`, {
        method: "DELETE",
      });
      await response.json();

      if (response.ok) {
        // Refresh the trainings list after successful deletion
        getTrainings(currentPage, itemsPerPage);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
    setIsDeleteing(false)
  };

  useEffect(() => {
    getTrainings(currentPage, itemsPerPage);
  }, [getTrainings, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Table className='min-h-[200px]'>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Training Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>CreatedAt</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fetchingTrainings || isDeleting ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                <div className="flex justify-center">
                  <ClipLoader color={'#000'} size={20} />
                </div>
              </TableCell>
            </TableRow>
          ) : trainings && trainings.length <= 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No trainings
              </TableCell>
            </TableRow>
          ) : (
            trainings && trainings.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{convertISODate(item.createdAt)}</TableCell>
                <TableCell>{convertISODate(item.updatedAt) || "Not Trained Yet"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className=" hover:bg-transparent">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent  align="end">
                      <DropdownMenuItem className='cursor-pointer' onClick={() => deleteTraining(item.id)}>
                        Delete Training
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalItems === 0 ? 1 : totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </>
  );
};

export default TableComponent;
