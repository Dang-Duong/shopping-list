"use client";

import { useState } from "react";
import { User } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User as UserIcon, X } from "lucide-react";

interface MemberListProps {
  members: User[];
  owner: User;
  currentUserId: string;
  isOwner: boolean;
  onRemoveMember: (userId: string) => void;
  onLeaveList: () => void;
  onAddMember: (email: string) => void;
}

export default function MemberList({
  members,
  owner,
  currentUserId,
  isOwner,
  onRemoveMember,
  onLeaveList,
  onAddMember,
}: MemberListProps) {
  const [email, setEmail] = useState("");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onAddMember(email.trim());
      setEmail("");
    }
  };

  const allMembers = [owner, ...members.filter((m) => m.id !== owner.id)];
  const isCurrentUserMember =
    !isOwner && allMembers.some((m) => m.id === currentUserId);

  return (
    <Card className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border-0">
      <CardHeader className="pb-3">
        <h2 className="text-xl font-semibold">Members</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {allMembers.map((member) => {
          const isMemberOwner = member.id === owner.id;
          const isCurrentUser = member.id === currentUserId;
          const canRemove = isOwner && !isMemberOwner;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-sm text-gray-600">(You)</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {isMemberOwner ? "Owner" : "Member"}
                  </span>
                </div>
              </div>
              {canRemove && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}

        {isOwner && (
          <form
            onSubmit={handleAddMember}
            className="flex flex-col sm:flex-row gap-2 pt-3"
          >
            <Input
              type="email"
              placeholder="Add member by email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto w-full"
            >
              Add
            </Button>
          </form>
        )}

        {isCurrentUserMember && (
          <Button
            onClick={onLeaveList}
            variant="outline"
            className="w-full mt-3 border-red-300 text-red-700 hover:bg-red-50"
          >
            Leave List
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
